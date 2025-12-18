# Thermal Hubble - AI-Powered Hazmat Compliance Validator

**Thermal Hubble** is an advanced Hazardous Materials (DG) shipping compliance tool designed for warehouse shippers. It leverages **Google Gemini's Multimodal AI** to validate dangerous goods shipments against strict regulations (IATA, DOT 49 CFR) and carrier-specific rules (FedEx, UPS).

## 🚀 Key Features

### 1. 🔍 AI-Powered Compliance Validation
- **Screenshot Analysis (DG Validator):** Drag & drop screenshots from shipping software (like Piyovi or FedEx Ship Manager). The AI visually scans the image to detect errors, missing fields, or mismatched UN numbers/Packing Groups.
- **Form Validation:** Real-time data entry validation for Hazmat forms.
- **Intelligent Suggestions:** Auto-completes complex fields (Proper Shipping Names, Packing Instructions) based on the UN number and mode of transport.

### 2. 🧠 Weighted Context Engine
- **Local "Knowledge Base":** Upload your own PDF guides, SOPs, or text-based rules directly to the browser (processed via **Gemini OCR** for maximum accuracy).
- **External Context (MCP):** Connect to **Model Context Protocol (MCP)** servers to fetch real-time regulatory updates or external database records.
- **Influence Control:** Assign "Weights" (0-100%) to different sources. Tell the AI to trust your "Strict SOP" (100%) over a "General Guideline" (50%).

### 3. ⚡ Optimized for Warehouse Velocity
- **Paste Support:** "Just paste" functionality (Ctrl+V) for rapid screenshot validation.
- **Offline-First:** Heavy documents are stored locally in **IndexedDB** for instant access without re-uploading.
- **Privacy Focused:** User data and API keys stay in user's LocalStorage; documents stay in their browser.

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, TypeScript
- **Styling:** Tailwind CSS 4.0, Framer Motion
- **AI Core:** Google Gemini 2.0 Flash / 1.5 Flash (via Google Generative AI SDK)
- **Integrations:** Model Context Protocol (MCP) via SSE (Server-Sent Events)
- **Storage:** IndexedDB (`idb-keyval`) for large vector/text context

## 📦 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mstanczak/thermal-hubble.git
    cd thermal-hubble
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Configure API Keys:**
    - Open the **Settings Panel** (gear icon).
    - Enter your **Google Gemini API Key**.
    - Configure your validation models and upload any custom rulebooks.

## 🚢 Deployment

This project is configured for **Cloudflare Pages**.
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

---

*Verified for compliance with IATA DGR and DOT 49 CFR regulations.*
