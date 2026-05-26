# System Architecture & API Documentation

VedaAI is structured as a decoupled, full-stack application consisting of a React-based Next.js frontend and a TypeScript Node/Express backend. Real-time updates, background scheduling, caching, and document rendering are handled via specialized modular services.

---

## 🏗️ Architecture Overview

The system flow and component interactions are outlined in the diagram below:

```
                  +-----------------------------------+
                  |        Next.js Frontend           |
                  |  (Zustand State, Vanilla CSS)    |
                  +-----------------+-----------------+
                                    |
            REST APIs (Port 5001)   |   WebSockets (Port 5002)
            ------------------------+------------------------
            |                                               |
            v                                               v
+-----------+-----------+                      +------------+------------+
|  Express REST Server  |                      |    WS WebSocket Server  |
| (Routes, Controllers) |                      | (Progress Push Streams) |
+-----------+-----+-----+                      +------------+------------+
            |     |                                         ^
            |     +--------------------+                    |
     Caches |                          | Writes             | Triggers
            v                          v                    |
+-----------+-----------+      +-------+-------+      +-----+-----+
|   Redis/Memory Cache  |      |    MongoDB    |      |  BullMQ/  |
|  (60s TTL Cache Layer)|      |  (Mongoose)   |      | In-Memory |
+-----------------------+      +---------------+      +-----+-----+
                                                            |
                                                            | Invokes
                                                            v
                                                   +--------+--------+
                                                   | Gemini AI &     |
                                                   | PDFKit Services |
                                                   +-----------------+
```

### Architecture Core Principles
1.  **Strict Schema Enforcement**: We configure Gemini 2.5 Flash using the structured JSON response schemas supported natively by the Google Gen AI SDK. This guarantees that the AI output perfectly matches our interface models.
2.  **State Synchronization**: Zustand stores state changes locally. When a creation or regeneration request is submitted, the frontend opens a lightweight WebSocket connection to subscribe to real-time progress updates.
3.  **Job Separation**: Creating an assignment does not block the HTTP thread. It writes a `pending` assignment to MongoDB, queues the job via BullMQ (or the in-memory scheduler), and returns a `201 Created` status immediately.
4.  **On-The-Fly PDF Compilation**: Instead of storing bloated, static PDF files on disk, PDFs are compiled on-the-fly using PDFKit when the user clicks "Download". This ensures the PDF always reflects the latest state of the database and keeps disk usage extremely lean.

---

## 🗄️ Database Schema

### `Assignment` Schema
This represents the root assignment entity stored inside MongoDB:

```typescript
const QuestionTypeConfigSchema = new Schema({
  type: { type: String, required: true },
  count: { type: Number, required: true },
  marks: { type: Number, required: true }
});

const QuestionSchema = new Schema({
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'], required: true },
  marks: { type: Number, required: true }
});

const SectionSchema = new Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema]
});

const AssessmentResultSchema = new Schema({
  schoolName: { type: String, required: true },
  subject: { type: String, required: true },
  class: { type: String, required: true },
  timeAllowed: { type: String, required: true },
  maxMarks: { type: Number, required: true },
  sections: [SectionSchema]
});

const AssignmentSchema = new Schema({
  title: { type: String, required: true },
  schoolName: { type: String, required: true },
  subject: { type: String, required: true },
  gradeClass: { type: String, required: true },
  dueDate: { type: Date, required: true },
  questionsConfig: [QuestionTypeConfigSchema],
  additionalInstructions: { type: String },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  lifecycleStatus: { type: String, enum: ['ongoing', 'due', 'completed'], default: 'ongoing' },
  progress: { type: Number, default: 0 },
  result: AssessmentResultSchema,
  pdfUrl: { type: String },
  errorMsg: { type: String }
}, { timestamps: true });
```

---

## 📡 WebSocket Protocol (Port 5002)

To enable live progress tracking during generation, the frontend establishes a WebSocket connection and subscribes to the assignment ID:

### 1. Client Subscription Packet
```json
{
  "type": "subscribe",
  "assignmentId": "60d5ec49f390ef1488c9cf01"
}
```

### 2. Server Subscription Confirmation
```json
{
  "type": "subscribed",
  "assignmentId": "60d5ec49f390ef1488c9cf01",
  "message": "Successfully subscribed to updates for assignment 60d5ec49f390ef1488c9cf01"
}
```

### 3. Server Progress Milestones (Pushed at each stage)
*   **10%**: Pipeline initialized.
*   **30%**: Google Gemini AI model invoked.
*   **60%**: Structured JSON parsed and validated.
*   **85%**: PDF layout mapped and compiled.
*   **100%**: DB updated, PDF cached. Status set to `completed` or `failed`.

```json
{
  "type": "progress",
  "assignmentId": "60d5ec49f390ef1488c9cf01",
  "progress": 60,
  "status": "processing",
  "result": null,
  "errorMsg": null,
  "pdfUrl": null
}
```

---

## 🔌 REST API Endpoints (Port 5001)

### 1. System Health
*   **Method**: `GET`
*   **URL**: `/api/health`
*   **Response**: `200 OK`
    ```json
    {
      "status": "ok",
      "service": "VedaAI Assessment Creator API"
    }
    ```

### 2. Fetch All Assignments
*   **Method**: `GET`
*   **URL**: `/api/assignments`
*   **Caching**: Cached for 60 seconds.
*   **Logic**: Automatically scans and updates assignments whose due dates have passed from `ongoing` to `due`.
*   **Response**: `200 OK` (Array of Assignment objects)

### 3. Create New Assignment
*   **Method**: `POST`
*   **URL**: `/api/assignments`
*   **Headers**: `Content-Type: application/json`
*   **Body Schema**:
    ```json
    {
      "title": "Weekly Biology Test",
      "schoolName": "Green Valley High School",
      "subject": "Biology",
      "gradeClass": "9th Grade",
      "dueDate": "2026-06-15",
      "timeAllowed": "1 hour 30 minutes",
      "additionalInstructions": "Cover Photosynthesis and Plant Cells",
      "questionsConfig": [
        { "type": "Multiple Choice Questions", "count": 10, "marks": 1 },
        { "type": "Short Questions", "count": 5, "marks": 3 }
      ]
    }
    ```
*   **Response**: `201 Created` (The saved `pending` assignment object)

### 4. Fetch Assignment Details
*   **Method**: `GET`
*   **URL**: `/api/assignments/:id`
*   **Caching**: Cached individually for 60 seconds.
*   **Response**: `200 OK` (Single Assignment object)

### 5. Regenerate Assignment
*   **Method**: `POST`
*   **URL**: `/api/assignments/:id/regenerate`
*   **Logic**: Resets status to `pending`, clears older results, and re-queues the background generation job.
*   **Response**: `200 OK` (Reset Assignment object)

### 6. Delete Assignment
*   **Method**: `DELETE`
*   **URL**: `/api/assignments/:id`
*   **Response**: `200 OK`
    ```json
    {
      "success": true,
      "message": "Assignment successfully deleted."
    }
    ```

### 7. Update Lifecycle Status
*   **Method**: `PATCH`
*   **URL**: `/api/assignments/:id/status`
*   **Body**:
    ```json
    {
      "status": "completed"
    }
    ```
*   **Response**: `200 OK` (Updated Assignment object)

### 8. Download PDF
*   **Method**: `GET`
*   **URL**: `/api/assignments/:id/download`
*   **Headers Sent**:
    *   `Content-Type: application/pdf`
    *   `Content-Disposition: attachment; filename="weekly_biology_test_question_paper.pdf"`
*   **Logic**: Compiles the assignment data into a beautiful, double-bordered A4 document on-the-fly and streams the vector stream directly to the client.
