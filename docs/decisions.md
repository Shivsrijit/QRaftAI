# Engineering Approach & Design Decisions

This document outlines the core technical decisions, architectural patterns, and problem-solving strategies adopted during the development of the VedaAI Assessment Creator.

---

## ⚡ 1. Resolving Zustand SSR Hydration Anomalies

### The Problem
During development, we encountered Next.js hydration mismatch warnings. This occurred because the Zustand state store retrieved persistent settings (like `userName` or `schoolName`) from `localStorage` immediately upon module import. Since the server-side rendering (SSR) process has no access to the client’s browser `localStorage`, it pre-rendered the HTML using default values. When the client loaded the JavaScript bundle and initialized Zustand, it pulled personalizations from `localStorage`, causing the DOM tree to mismatch and trigger a hydration crash.

### Our Solution
We decoupled local storage retrieval from the initial store initialization. 
1.  We set the store variables to load with static, standard defaults (e.g., `userName: 'Lakshya'`) during server compile.
2.  We exposed a dedicated `initializeSettings` action in [useAssignmentStore.ts](file:///c:/Users/SSN/OneDrive%20-%20Shiv%20Nadar%20University%20-%20Chennai/Desktop/VEDA%20AI/frontend/src/store/useAssignmentStore.ts).
3.  We invoked `initializeSettings()` within a client-side `useEffect` hook in [page.tsx](file:///c:/Users/SSN/OneDrive%20-%20Shiv%20Nadar%20University%20-%20Chennai/Desktop/VEDA%20AI/frontend/src/app/page.tsx).

This ensures the initial page hydration is perfectly aligned between server and client, after which the client safely updates the store with user preferences.

---

## 🔀 2. Resilient Dual-Mode Background Queuing

### The Problem
In a production environment, generating structured question papers using LLMs is time-consuming and can cause HTTP requests to timeout. Using a background queue like BullMQ powered by Redis is essential to handle this asynchronously. However, requiring a running Redis instance makes local development and quick testing cumbersome for new developers who may not have Redis installed.

### Our Solution
We built a resilient, dual-mode queuing layer in [queue.service.ts](file:///c:/Users/SSN/OneDrive%20-%20Shiv%20Nadar%20University%20-%20Chennai/Desktop/VEDA%20AI/backend/src/services/queue.service.ts). 
1.  On boot, the backend uses a fast-failing test client to probe if a Redis server is active at `REDIS_URL`.
2.  **Production Mode**: If Redis is online, the system initializes a robust BullMQ queue and worker cluster with a concurrency rate of 2.
3.  **Fallback Mode**: If Redis is offline, the system catches the error, logs a helpful warning, and automatically swaps to an in-memory scheduler using Node's asynchronous `setTimeout` loops.

This approach guarantees that the codebase remains production-ready while remaining instantly runnable in a local, zero-dependency environment.

---

## 🛡️ 3. Real-Time Form Validations

### The Problem
Submitting incomplete form details or negative question configuration parameters not only ruins the user experience but also wastes precious AI tokens when the prompt fails or returns garbled responses. Catching these errors only upon clicking "Submit" or at the database schema constraint level is too late.

### Our Solution
We integrated a real-time validation pipeline using a React `useEffect` listener in [AssignmentForm.tsx](file:///c:/Users/SSN/OneDrive%20-%20Shiv%20Nadar%20University%20-%20Chennai/Desktop/VEDA%20AI/frontend/src/components/AssignmentForm.tsx).
*   It listens to changes across all critical input fields (`title`, `subject`, `gradeClass`, `dueDate`, `questionsConfig`).
*   It performs instantaneous validation checks (e.g., non-empty strings, valid non-past due dates, non-negative and non-zero counts/marks).
*   If a rule is violated, it sets the `validationError` state immediately, which displays the error banner *before* submission.
*   The "Next" stepper button's `disabled` attribute is bound to `!!validationError`. This prevents the user from even proceeding to the generation progress page if the configuration is invalid.

---

## 🏷️ 4. Combining Academic & Cognitive Tags (KL + Difficulty)

### The Problem
Earlier versions of the application utilized pure Knowledge Level tags (`KL1`, `KL2`, `KL3`) in accordance with structured CBSE/NCERT curriculum standards (representing Remembering, Applying, and Analyzing respectively). However, this created cognitive friction for general users who are accustomed to standard difficulty levels (`Easy`, `Medium`, `Hard`). Removing either label completely compromised either the professional academic rigor or the user friendliness of the app.

### Our Solution
We combined both concepts into unified tags:
*   `Easy` maps to **KL1 - Easy**
*   `Moderate` maps to **KL2 - Medium**
*   `Hard` maps to **KL3 - Hard**

We brought back these combined tags to the question badges in both the frontend layout and the PDF export stylesheet. Furthermore, we restored the **Knowledge Level (KL) Legend** at the bottom of the exam papers. This ensures that teachers can easily read the difficulty at a glance, while students and auditors retain the structured academic categorization.

---

## 📥 5. Natively Prompting File "Save As" Dialogs

### The Problem
Standard file downloads in modern web browsers automatically save files directly into the user's default "Downloads" folder. For busy educators managing multiple class sections, this forces them to manually open the folder, rename the file, and drag it to their preferred curriculum directory.

### Our Solution
We utilized the modern browser **FileSystem Write API** (`showSaveFilePicker`) in [QuestionPaper.tsx](file:///c:/Users/SSN/OneDrive%20-%20Shiv%20Nadar%20University%20-%20Chennai/Desktop/VEDA%20AI/frontend/src/components/QuestionPaper.tsx).
*   When a user clicks "Download as PDF", the app asks the browser to open a native OS "Save As" dialog prefilled with a sanitized filename (e.g., `midterm_physics_exam_question_paper.pdf`).
*   The user can choose the exact directory (e.g., a specific class folder or desktop) and rename the file before the write operation starts.
*   If the browser is older or does not support the FileSystem API, the code gracefully catches the error and falls back to a standard anchor click download.

---

## 📄 6. On-The-Fly PDF Compilation

### The Problem
Storing pre-rendered PDF files on disk consumes massive amounts of storage over time. It also risks serving outdated documents if the database record is updated or regenerated after the PDF is created.

### Our Solution
We chose to generate PDF documents dynamically in [pdf.service.ts](file:///c:/Users/SSN/OneDrive%20-%20Shiv%20Nadar%20University%20-%20Chennai/Desktop/VEDA%20AI/backend/src/services/pdf.service.ts) using **PDFKit**.
*   When a user hits the `/download` route, the backend fetches the assignment record from MongoDB, initiates a PDFKit stream, and writes the vector layout on-the-fly directly to the Express `Response` socket.
*   This approach completely eliminates static file clutter, guarantees that the downloaded document is always 100% in sync with the database record, and keeps the server storage footprint at an absolute minimum.
