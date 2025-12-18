# Thermal Hubble - AI-Powered Hazmat Compliance Validator

**Thermal Hubble** is an advanced Hazardous Materials (DG) shipping compliance tool designed for warehouse shippers. It leverages the cutting-edge **Google Gemini 3.0 (Preview)** and **Gemini 2.0 Flash** models to validate dangerous goods shipments against strict regulations (IATA, DOT 49 CFR) and carrier-specific rules (FedEx, UPS).

## 🚀 Key Features

### 1. 🔍 AI-Powered Compliance Validation
- **Screenshot Analysis (DG Validator):** Drag & drop screenshots from shipping software (like Piyovi or FedEx Ship Manager). The AI visually scans the image to detect errors, missing fields, or mismatched UN numbers/Packing Groups.
- **Form Validation:** Real-time data entry validation for Hazmat forms.
- **Intelligent Suggestions:** Auto-completes complex fields (Proper Shipping Names, Packing Instructions) based on the UN number and mode of transport.
- **Multi-Model Support:** Choose between speed (**Gemini 3.0 Flash Preview**, **Gemini 2.5 Flash**) and deep reasoning (**Gemini 1.5 Pro**, **Gemini 2.0 Flash Thinking**).

### 2. 🧠 Weighted Context Engine
- **Local "Knowledge Base":** Upload your own PDF guides, SOPs, or text-based rules directly to the browser (processed via **Gemini OCR** for maximum accuracy).
- **External Context (MCP):** Connect to **Model Context Protocol (MCP)** servers to fetch real-time regulatory updates or external database records.
- **Influence Control:** Assign "Weights" (0-100%) to different sources. Tell the AI to trust your "Strict SOP" (100%) over a "General Guideline" (50%).

### 3. ⚡ Optimized for Warehouse Velocity
- **Paste Support:** "Just paste" functionality (Ctrl+V) for rapid screenshot validation.
- **Offline-First:** Heavy documents are stored locally in **IndexedDB** for instant access without re-uploading.
- **Privacy Focused:** User data and API keys stay in user's LocalStorage; documents stay in your browser.

## 💡 Why Thermal Hubble?

Shipping Dangerous Goods (DG) is high-stakes. A single error can lead to:
*   **Failed Inspections** ($$$ fines)
*   **Delayed Shipments** (Unsatisfied customers)
*   **Carrier Bans** (Loss of shipping ability)

**Thermal Hubble** acts as a second pair of expert eyes. It doesn't just check if a field is filled; it "reads" the regulations to ensure your UN number matches your Packing Group, your quantity labels are correct for the aircraft type, and your carrier-specific variations are met. It turns a manual, error-prone checklist into an automated, AI-verified workflow.

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, TypeScript
- **Styling:** Tailwind CSS 4.0, Framer Motion
- **AI Core:** Google Gemini 3.0 (Preview), 2.5 Flash, 2.0 Flash Thinking, 1.5 Flash
- **Integrations:** Model Context Protocol (MCP) via SSE
- **Storage:** IndexedDB (`idb-keyval`)

## 🗺️ Roadmap

*   [ ] **Anthropic Support:** Integration with Claude 3.5 Sonnet / 3.7 Opus for alternative reasoning.
*   [ ] **OpenAI Support:** Integration with GPT-4.5 / o1 models.
*   [ ] **Mobile App:** Scan labels directly from the warehouse floor.

## 📦 Prerequisites

To use this application, you must have a **Google Gemini API Key**.
1.  Get a key for free at [Google AI Studio](https://aistudio.google.com/).
2.  Enter it in the **Settings Panel** (gear icon) of the app.
3.  (Optional) Ensure you have access to the experimental models if you select "Preview" versions.

## 🚀 Deployment (Cloudflare Pages)

This project is optimized for **Cloudflare Pages**, which offers a generous **Free Tier**.

### Cloudflare Free Tier Limits
*   **Unlimited** Sites
*   **Unlimited** Requests
*   **Unlimited** Bandwidth
*   **500** Builds per month
*   [View Full Limits](https://developers.cloudflare.com/pages/platform/limits/)

### How to Deploy (Zero Config)
1.  Fork this repository to your GitHub account.
2.  Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
3.  Go to **Compute (Workers & Pages)** > **Create Application** > **Pages** > **Connect to Git**.
4.  Select your `thermal-hubble` repository.
5.  **Build Settings:**
    *   **Framework Preset:** Vite
    *   **Build command:** `npm run build`
    *   **Build output directory:** `dist`
6.  Click **Save and Deploy**.

Cloudflare will automatically build your site. Any time you push code to GitHub, your site will update instantly!

---

*Verified for compliance with IATA DGR and DOT 49 CFR regulations.*
