import { GoogleGenerativeAI } from "@google/generative-ai";
import type { HazmatFormData } from "./validation";
import { REGULATION_RULES } from "../data/regulations";
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
// Set worker source for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface ValidationIssue {
  description: string;
  confidence: number;
  regulationReference: string;
  recommendation: string;
  severity: 'Critical' | 'Warning' | 'Info';
  explanation?: string;
}

export interface ValidationResult {
  status: 'Pass' | 'Fail' | 'Warnings';
  issues: ValidationIssue[];
}

export async function validateShipmentWithGemini(
  data: HazmatFormData,
  apiKey: string,
  modelId: string = "gemini-1.5-flash"
): Promise<ValidationResult> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelId });

    const prompt = `
      You are a hazmat shipping compliance expert. Analyze this dangerous goods shipment for compliance with [IATA/DOT 49 CFR] regulations and [FedEx/UPS] carrier-specific requirements.

      Shipment Details:
      - Carrier: ${data.carrier}
      - Mode: ${data.mode}
      - Service: ${data.service}
      - Regulation: ${data.mode === 'Air' ? 'IATA DGR' : 'DOT 49 CFR'}
      - UN Number: ${data.unNumber}
      - Proper Shipping Name: ${data.properShippingName}
      - Technical Name: ${data.technicalName || 'N/A'}
      - Hazard Class: ${data.hazardClass}
      - Packing Group: ${data.packingGroup || 'N/A'}
      - Quantity: ${data.quantity} ${data.quantityUnit}
      - Packaging Type: ${data.packagingType || 'N/A'}
      - Packing Instruction: ${data.packingInstruction || 'N/A'}
      - CAO: ${data.cargoAircraftOnly ? 'Yes' : 'No'}
      - Reportable Quantity: ${data.reportableQuantity ? 'Yes' : 'No'}

      Reference the following carrier-specific rules:
      ${JSON.stringify(REGULATION_RULES[data.carrier][data.mode])}

      Analyze for:
      1. Prohibited commodities for this carrier/service combination
      2. Missing required data fields
      3. Incorrect packaging instruction or container type
      4. Service eligibility issues (e.g., ADG on non-premium service)
      5. Marking and labeling requirements
      6. Documentation gaps

      For each issue found, provide a JSON object with the following structure. 
      Return ONLY a valid JSON object with a "status" field (Pass/Fail/Warnings) and an "issues" array.
      
      Example JSON format:
      {
        "status": "Fail",
        "issues": [
          {
            "description": "Issue description",
            "confidence": 95,
            "regulationReference": "IATA DGR 1.2.3",
            "recommendation": "Fix recommendation",
            "severity": "Critical",
            "explanation": "Why this matters"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up markdown code blocks if present
    const jsonString = text.replace(/```json\n|\n```/g, "").trim();

    try {
      return JSON.parse(jsonString) as ValidationResult;
    } catch (e) {
      console.error("Failed to parse JSON:", jsonString);
      throw new Error("Invalid response format from AI model");
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const errorMessage = error.message || "Unknown error";
    throw new Error(`Gemini API Error: ${errorMessage}`);
  }
}

export async function parseSDSWithGemini(
  file: File,
  apiKey: string,
  _modelId: string = "gemini-1.5-flash",
  onProgress?: (status: string) => void
): Promise<Partial<HazmatFormData> & { confidence?: Record<string, number> }> {
  try {
    // Stage 1: OCR with Tesseract.js
    const ocrText = await performOCR(file, onProgress);

    // Stage 2: Data Extraction with selected model
    if (onProgress) onProgress("Extracting Shipping Data...");
    const data = await extractDataFromText(ocrText, apiKey);

    return data;
  } catch (error: any) {
    console.error("SDS Parsing Error:", error);
    throw error;
  }
}

async function performOCR(file: File, onProgress?: (status: string) => void): Promise<string> {
  if (onProgress) onProgress("Initializing OCR engine...");

  const worker = await createWorker('eng', 1, {
    logger: m => {
      if (m.status === 'recognizing text') {
        const progress = Math.round(m.progress * 100);
        if (onProgress) onProgress(`Scanning Document: ${progress}%`);
      } else {
        if (onProgress) onProgress(`OCR Status: ${m.status}`);
      }
    }
  });

  let text = '';

  try {
    if (file.type === 'application/pdf') {
      if (onProgress) onProgress("Converting PDF to images...");
      const images = await convertPdfToImages(file);

      for (let i = 0; i < images.length; i++) {
        if (onProgress) onProgress(`Scanning Page ${i + 1} of ${images.length}...`);
        const ret = await worker.recognize(images[i], { rotateAuto: true });
        text += ret.data.text + '\n\n';
      }
    } else {
      const ret = await worker.recognize(file, { rotateAuto: true });
      text = ret.data.text;
    }
  } finally {
    await worker.terminate();
  }

  return text;
}

async function convertPdfToImages(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const images: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // Scale up for better OCR quality
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) continue;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas, // Fix for type definition requiring canvas
    } as any).promise;

    images.push(canvas.toDataURL('image/png'));
  }

  return images;
}

async function extractDataFromText(text: string, apiKey: string): Promise<Partial<HazmatFormData> & { confidence?: Record<string, number> }> {
  const genAI = new GoogleGenerativeAI(apiKey);
  // Always use flash-lite for fast extraction, regardless of user's model selection
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

  const prompt = `
      Analyze the following text extracted from a Safety Data Sheet (SDS) or shipping document.
      Extract the following hazardous materials shipping information:
      - UN Number (e.g., UN1263)
      - Proper Shipping Name
      - Hazard Class
      - Packing Group (I, II, or III)
      - Technical Name (only if the proper shipping name contains "n.o.s." or requires it)
      - Packing Instruction (e.g., 355, Y344, 965)
      - Packaging Type Description (e.g., "1 Fibreboard Box x 4 L", "2 Steel Drums x 10 kg")

      For each extracted field, provide a confidence score from 0 to 100 based on how certain you are about the extraction.

      Return a JSON object with these keys:
      {
        "unNumber": "string",
        "properShippingName": "string",
        "hazardClass": "string",
        "packingGroup": "string",
        "technicalName": "string",
        "packingInstruction": "string",
        "packagingType": "string",
        "confidence": {
          "unNumber": number,
          "properShippingName": number,
          "hazardClass": number,
          "packingGroup": number,
          "technicalName": number,
          "packingInstruction": number,
          "packagingType": number
        }
      }
      If a field is not found, return null or an empty string for the value, and 0 for confidence.
      IMPORTANT: Return ONLY the raw JSON object. Do not use Markdown formatting. Do not include any conversational text.

      Document Text:
      ${text.substring(0, 30000)}
    `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const responseText = response.text();

  // Robust JSON extraction
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const jsonString = jsonMatch ? jsonMatch[0] : responseText.replace(/```json\n|\n```/g, "").trim();

  try {
    return JSON.parse(jsonString);
  } catch (e: any) {
    console.error("JSON Parse Error", e);
    console.error("Raw Text", responseText);
    throw new Error("Failed to parse extracted data as JSON.");
  }
}

export interface Suggestion {
  value: string;
  confidence: number;
  reasoning: string;
}

export async function getFieldSuggestions(
  data: HazmatFormData,
  fieldName: string,
  apiKey: string,
  modelId: string = "gemini-1.5-flash"
): Promise<Suggestion[]> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelId });

    const prompt = `
      You are a hazmat shipping expert. Based on the current shipment details, suggest the most likely values for the "${fieldName}" field.
      
      Current Form Data:
      - Carrier: ${data.carrier}
      - Mode: ${data.mode}
      - UN Number: ${data.unNumber}
      - Proper Shipping Name: ${data.properShippingName}
      - Hazard Class: ${data.hazardClass}
      - Packing Group: ${data.packingGroup}
      - Quantity: ${data.quantity} ${data.quantityUnit}
      
      Provide 1-3 recommendations for "${fieldName}".
      Sort by confidence (highest first).
      
      Return ONLY a JSON array of objects with this structure:
      [
        {
          "value": "suggested value",
          "confidence": number (0-100),
          "reasoning": "brief explanation why"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonString = text.replace(/```json\n|\n```/g, "").trim();
    return JSON.parse(jsonString) as Suggestion[];
  } catch (error) {
    console.error("Suggestion Error:", error);
    return [];
  }
}
