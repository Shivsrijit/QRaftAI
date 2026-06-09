# QRaft Assessment Creator

Deployment Link: https://qraft-ai-assessment-generator-shiv.vercel.app/

QRaft is an AI powered assessment generation platform built for educators to compile curriculum aligned question papers and export them as formatted, print ready PDFs.

The application uses Google's Gemini 2.5 Flash model to generate structured academic assessments tailored to custom classroom specifications.

## Key Features

* **Secure Multi-User Authentication**: Features a secure JWT-based authentication system supporting user registration, login, session persistence, and custom user profiles.
* **Strict Multitenancy Security**: Enforces complete data isolation. Every API request and PDF generation task is validated against the authenticated user's ID, ensuring one user cannot access or view another user's files.
* **Intelligent Generation**: Utilizes the Google Gen AI SDK to prompt Gemini 2.5 Flash with structured JSON schemas, producing precise, curriculum aligned questions.
* **Flexible Reference Uploads**: Drag and drop custom lesson plans, textbook chapters, or reference sheets (.pdf, .txt, .docx) to focus the AI's question generation.
* **Realtime Validation**: Validates input fields, date boundaries, and question configuration metrics in realtime to prevent invalid submissions and reduce API overhead.
* **Dynamic Configurations**: Allows teachers to define multiple question types (such as MCQs, Short Answers, Diagram/Graph based) with customizable question counts and mark weights per row.
* **Live Progress Streaming**: Integrated WebSocket server streams generation milestone events (10% to 100%) in realtime, displaying a progress tracker in the browser.
* **A4 Print Ready Formatting**: Formats completed assessments into double bordered academic sheets with student info blocks, clear sections, and standardized difficulty badges (KL1: Easy, KL2: Medium, KL3: Hard).
* **Secure Blob Downloads**: Fetches PDF sheets securely using authorization headers and compiles them into local in-memory Object URLs, preventing token exposure in browser navigation history.
* **Obsidian Space Glassmorphic Design**: A premium dark-theme interface boasting modern typography, Gilded Gold accents, backdrop blur filters, and sleek hover glow micro-animations.

## Tech Stack

### Frontend
* **Core**: Next.js 15+ (App Router), React 19, TypeScript
* **State Management**: Zustand (with optimized client side hydration sync)
* **Styling**: Pure CSS Modules for isolated, performant layout styling
* **Icons**: Lucide React

### Backend
* **Core**: Node.js, Express, TypeScript
* **Database**: MongoDB (via Mongoose)
* **Queuing & Background Jobs**: BullMQ & Redis (with automatic in-memory queue fallback if Redis is offline)
* **Realtime Communication**: WS (WebSocket Server)
* **Document Generation**: PDFKit (raw vector PDF rendering)
* **AI Engine**: Google Gen AI SDK (Gemini 2.5 Flash)

## Documentation Directory

To help you get started or understand the underlying design of the application, we have broken down the documentation into the following guides:

* **[Setup Instructions (docs/setup.md)](./docs/setup.md)**: Step by step instructions on setting up, configuring, and running the frontend, backend, and background queue services locally from scratch.
* **[Architecture & API Docs (docs/architecture.md)](./docs/architecture.md)**: A deep dive into the QRaft system architecture, data models, WebSocket protocols, and comprehensive REST API endpoints.
* **[Engineering Approach & Decisions (docs/decisions.md)](./docs/decisions.md)**: Explanations of why certain architectural patterns were selected, how we solved complex SSR hydration and concurrency issues, and key product decisions.
