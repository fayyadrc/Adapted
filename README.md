# Adapted

Adapted is an AI-powered educational platform that transforms static learning materials into interactive, engaging study experiences. It allows users to upload documents such as PDFs and Word files and automatically generates structured learning outputs like summaries, mind maps, quizzes, audio narration, and assessments.

This repository contains both the backend and frontend code that power the Adapted platform. The goal of this README is to help new developers understand what the project does, how it is structured, and where to start when contributing.

---

## Overview

At its core, Adapted focuses on making learning more accessible and personalized. Instead of passively reading documents, learners can interact with content that has been analyzed, reorganized, and enhanced using modern AI tools.

The platform integrates several third-party services:

- Google Gemini for content understanding and structured generation  
- ElevenLabs for high-quality text-to-speech audio  
- Supabase for authentication, storage, and database management  

The system is split into a Python-based backend API and a React frontend application.

---

## Technology Stack

### Backend

- **Language:** Python 3.9+  
- **Framework:** Flask (REST API and static serving)  
- **Database and Authentication:** Supabase (PostgreSQL)  
- **AI and Content Generation:** Google Gemini  
- **Audio Generation:** ElevenLabs API  
- **File Processing:**
  - PyMuPDF for PDF parsing  
  - python-docx for Word document parsing  

### Frontend

- **Framework:** React (Vite)  
- **Styling:** TailwindCSS and vanilla CSS  
- **Animations:** Framer Motion  
- **State Management and Data Fetching:** React Query (`@tanstack/react-query`)  
- **Visualizations:**
  - React Flow for mind maps  
  - React D3 Tree for hierarchical structures  

---

## Project Structure

The repository is organized into two main directories: `backend` and `frontend`.

---

## Backend (`/backend`)

The backend is a modular Flask application designed around clear separation of concerns. API routes, business logic, and utilities are kept distinct to make the codebase easier to understand and extend.

### Key Files and Directories

| Path | Description |
|------|-------------|
| `app/__init__.py` | Application factory. Initializes Flask, configures CORS, sets up the Supabase client, and registers API blueprints. |
| `app/api/` | Contains all API route handlers. Each file groups related endpoints together. |
| `app/api/upload.py` | Handles file uploads, extracts text from documents, and orchestrates AI-driven generation such as mind maps, audio, and quizzes. |
| `app/api/assessment.py` | Contains logic and endpoints for cognitive assessments (for example, CAT4-style assessments). |
| `app/api/infographic.py` | Endpoints responsible for generating structured “Bento Box” infographic data. |
| `app/api/folders.py` | Manages user folders and library organization. |
| `app/services/` | Business-level logic and wrappers around external services. |
| `app/services/ai_service.py` | Core AI logic. Responsible for prompting Google Gemini and enforcing structured JSON outputs for summaries, quizzes, and mind maps. |
| `app/services/audio_service.py` | Handles text-to-speech generation using ElevenLabs. |
| `app/utils/` | Shared helper utilities, such as text extraction and file parsing logic. |
| `requirements.txt` | Python dependencies required to run the backend. |

---

## Frontend (`/frontend`)

The frontend is a single-page React application that communicates with the backend through a clean API layer. It is responsible for user interaction, visualization, and overall user experience.

### Key Files and Directories

| Path | Description |
|------|-------------|
| `src/App.jsx` | Main application router. Defines public and protected routes and handles overall layout logic. |
| `src/components/` | Reusable UI components and page-level views. |
| `src/components/Upload.jsx` | Primary content creation page. Handles document uploads and generation options. |
| `src/components/Library.jsx` | Displays the user’s saved content, generated materials, and folder structure. |
| `src/components/Assessment.jsx` | Interface for taking cognitive assessments. |
| `src/components/MindMapViewer.jsx` | Renders AI-generated mind maps using React Flow. |
| `src/services/apiService.js` | Centralized API client for communicating with the backend. |

---

## Beta Status

The Adapted platform is currently in the **beta phase** and is being used for **MVP testing**.

At this stage, the available functionality focuses on core learning enhancements, including:

- Visual summaries generated from uploaded documents  
- Auditory summaries delivered through AI-generated narration  

Additional features such as assessments, mind maps, and advanced learning tools are under active development and will be introduced in future iterations.

---

## Development Notes

- The backend is designed to be API-first. The frontend should never directly handle AI logic or document parsing.
- All AI outputs are expected to be structured and validated before being returned to the client.
- Supabase is used for both authentication and persistent storage, reducing the need for custom auth logic.
- Visual components such as mind maps and trees rely heavily on consistent JSON schemas generated by the AI layer.

---

## Getting Started

To work on this project locally:

1. Set up the backend environment and install Python dependencies from `requirements.txt`.
2. Configure environment variables for Supabase, Google Gemini, and ElevenLabs.
3. Start the Flask backend.
4. Install frontend dependencies and start the React development server.
5. Ensure the frontend is correctly pointing to the backend API.

Detailed setup instructions can be added later if this repository is opened to external contributors.

---

## Contributing

Contributions should follow the existing structure and conventions used in the codebase. When adding new features:

- Keep API routes thin and move logic into services where possible.
- Avoid coupling frontend components directly to AI output formats without validation.
- Document any new endpoints or major architectural decisions.
