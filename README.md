# VedaAI Assessment Creator

VedaAI is a production-grade, AI-powered assessment generation platform designed specifically for educators. It enables teachers to instantly compile high-quality, curriculum-aligned question papers and export them into beautifully formatted, print-ready PDFs. 

Built with a modern, high-performance tech stack, VedaAI leverages the power of Google's Gemini 2.5 Flash model to generate rigorous, highly structured academic assessments tailored to custom classroom specifications.

---

## 🚀 Key Features

*   **Intelligent AI Generation**: Utilizes the Google Gen AI SDK to prompt Gemini 2.5 Flash with structured JSON schemas, producing precise, curriculum-aligned questions.
*   **Flexible Reference Uploads**: Drag-and-drop custom lesson plans, textbook chapters, or reference sheets (.pdf, .txt, .docx) to focus the AI's question generation.
*   **Real-time Validation**: Validates all input fields, date boundaries, and question configuration metrics in real-time, preventing invalid submissions and reducing API overhead.
*   **Dynamic Configurations**: Allows teachers to define multiple question types (e.g., MCQs, Short Answers, Diagram/Graph-based) with customizable question counts and mark weights per row.
*   **Live Progress Streaming**: Integrated WebSocket server streams generation milestone events (10% to 100%) in real-time, displaying a premium progress tracker in the browser.
*   **A4 Print-Ready Formatting**: Formats completed assessments into beautiful, double-bordered academic sheets with student info blocks, clear sections, and standardized difficulty badges (`KL1 - Easy`, `KL2 - Medium`, `KL3 - Hard`).
*   **System "Save As" Prompts**: Natively prompts the OS file system to choose the file location and name when downloading completed PDF question papers.
*   **Sleek Glassmorphic Design**: A premium interface boasting modern typography, subtle micro-animations, and a highly polished dark/light mode toggle.

---

## 🛠️ Tech Stack

### Frontend
*   **Core**: Next.js 15+ (App Router), React 19, TypeScript
*   **State Management**: Zustand (with optimized client-side hydration sync)
*   **Styling**: Pure CSS Modules for isolated, performant layout styling
*   **Icons**: Lucide React

### Backend
*   **Core**: Node.js, Express, TypeScript
*   **Database**: MongoDB (via Mongoose)
*   **Queuing & Background Jobs**: BullMQ & Redis (with automatic in-memory queue fallback if Redis is offline)
*   **Real-time Communication**: WS (WebSocket Server)
*   **Document Generation**: PDFKit (raw vector PDF rendering)
*   **AI Engine**: Google Gen AI SDK (Gemini 2.5 Flash)

---

## 📖 Documentation Directory

To help you get started or understand the underlying design of the application, we've broken down the documentation into the following guides:

*   **[Setup Instructions (docs/setup.md)](./docs/setup.md)**: Step-by-step instructions on setting up, configuring, and running the frontend, backend, and background queue services locally from scratch.
*   **[Architecture & API Docs (docs/architecture.md)](./docs/architecture.md)**: A deep-dive into the VedaAI system architecture, data models, WebSocket protocols, and comprehensive REST API endpoints.
*   **[Engineering Approach & Decisions (docs/decisions.md)](./docs/decisions.md)**: Explanations of why certain architectural patterns were selected, how we solved complex SSR hydration and concurrency issues, and key product decisions.
