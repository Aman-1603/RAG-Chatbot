# 🧠 RAG Chatbot — Chat with Your PDF Using AI

> Built by **Aman Ansari** | Full Stack AI Project

![RAG Chatbot](https://img.shields.io/badge/AI-RAG%20Powered-7c3aed)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61dafb)
![Pinecone](https://img.shields.io/badge/Vector%20DB-Pinecone-00b4d8)
![Groq](https://img.shields.io/badge/LLM-Groq%20%2B%20LLaMA3-f97316)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📌 What is This Project?

**RAG Chatbot** is a full-stack AI application that allows you to:

1. **Upload any PDF** (resume, textbook, research paper, legal document)
2. **Ask questions** about the content in natural language
3. **Get accurate AI-powered answers** based strictly on your document

This is not just a simple chatbot — it uses a technique called **RAG (Retrieval Augmented Generation)** which makes the AI answer from YOUR document instead of hallucinating or guessing.

---

## 🤔 What is RAG?

**RAG = Retrieval Augmented Generation**

Think of it this way:

Without RAG:
You → "What is in my document?" → AI guesses ❌

With RAG:
You → "What is in my document?"
↓
AI searches your document
↓
Finds relevant sections
↓
Answers based on those sections ✅


### Real World Analogy
Imagine you hire a new employee and give them your company handbook. 

- **Without RAG** → The employee answers from general knowledge (might be wrong)
- **With RAG** → The employee reads the handbook first, then answers accurately

---

## 🏗️ Architecture

┌─────────────────────────────────────────────────────┐
│ USER BROWSER │
│ React + TypeScript + Tailwind │
│ http://localhost:3000 │
└─────────────────────────┬───────────────────────────┘
│ HTTP Requests
▼
┌─────────────────────────────────────────────────────┐
│ EXPRESS SERVER (Node.js) │
│ Middleware Layer │
│ http://localhost:5000 │
│ │
│ • Receives requests from React │
│ • Handles file uploads (multer) │
│ • Forwards to FastAPI │
│ • Returns responses to React │
└─────────────────────────┬───────────────────────────┘
│ HTTP Requests
▼
┌─────────────────────────────────────────────────────┐
│ FASTAPI SERVER (Python) │
│ http://localhost:8000 │
│ │
│ POST /upload → ingest_pdf() │
│ POST /ask → ask_question() │
└──────┬──────────────────────────────────┬───────────┘
│ │
▼ ▼
┌─────────────┐ ┌────────────────────┐
│ PINECONE │ │ GROQ API │
│ Vector DB │ │ LLaMA 3.3 70B │
│ (Cloud) │ │ (Free LLM) │
└─────────────┘ └────────────────────┘


---

## 🔄 How It Works — Step by Step

### 📤 When You Upload a PDF:

PDF File
│
▼

PyPDF extracts text page by page
│
▼
LangChain splits text into chunks (500 chars with 50 overlap)
│
▼
sentence-transformers converts each chunk into 384 numbers (embedding)
│
▼
Pinecone stores all chunks + embeddings in the cloud
│
▼
✅ PDF is now searchable!

### 💬 When You Ask a Question:

Your Question: "What are Aman's skills?"
│
▼

sentence-transformers converts question into 384 numbers
│
▼
Pinecone finds the most similar chunks using cosine similarity
│
▼
Top 4 most relevant chunks are retrieved
│
▼
Chunks + Question are sent to Groq (LLaMA 3.3 70B)
│
▼
LLaMA generates an accurate answer based on the chunks
│
▼
✅ You get an accurate answer!

---

## 🛠️ Tech Stack & Why We Chose Each

| Technology | Used For | Why |
|-----------|---------|-----|
| **React + TypeScript** | Frontend UI | Industry standard, type-safe |
| **Tailwind CSS** | Styling | Rapid beautiful UI development |
| **Node.js + Express** | Middleware | Handles file uploads, routing |
| **Python + FastAPI** | Backend API | Fast, async, perfect for AI |
| **PyPDF** | PDF text extraction | Simple, reliable, free |
| **LangChain** | Text chunking | Smart splitting, no cut sentences |
| **HuggingFace API** | Embeddings | Free, cloud-based, no memory issues |
| **Pinecone** | Vector database | Cloud-based, scalable, free tier |
| **Groq + LLaMA 3.3** | AI answers | Free, blazing fast inference |
| **ChromaDB** (replaced) | Old vector DB | Was local only, not deployable |

---

## 📁 Project Structure

rag-chatbot/
│
├── 📁 backend/ # Python FastAPI server
│ ├── main.py # API routes (/upload, /ask)
│ ├── rag_pipeline.py # Core RAG logic (ingest + query)
│ ├── pdf_loader.py # Extract text from PDF
│ ├── chunker.py # Split text into chunks
│ ├── embedder.py # Convert text to vectors
│ ├── vector_store.py # Pinecone save/search
│ ├── requirements.txt # Python dependencies
│ └── .env # API keys (not in git)
│
├── 📁 server/ # Node.js Express middleware
│ ├── src/
│ │ └── index.ts # Express routes
│ ├── package.json
│ └── tsconfig.json
│
├── 📁 frontend/ # React TypeScript app
│ ├── src/
│ │ ├── App.tsx # Main chat UI
│ │ └── index.css # Tailwind imports
│ ├── package.json
│ └── tailwind.config.js
│
├── start.bat # One-click start (Windows)
└── README.md # This file


---

## ⚙️ Prerequisites

Before running this project, make sure you have:

- ✅ **Python 3.10+** → [Download](https://python.org)
- ✅ **Node.js 18+** → [Download](https://nodejs.org)
- ✅ **Git** → [Download](https://git-scm.com)
- ✅ **Groq API key** (free) → [Get it here](https://console.groq.com)
- ✅ **Pinecone API key** (free) → [Get it here](https://app.pinecone.io)

---

## 🚀 Installation & Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Aman-1603/RAG-Chatbot.git
cd RAG-Chatbot
```

### Step 2 — Backend Setup

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
GROQ_API_KEY=your_groq_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=rag-chatbot
```

### Step 3 — Pinecone Index Setup

1. Go to [app.pinecone.io](https://app.pinecone.io)
2. Click **Database** → **Create Index**
3. Set:
   - **Name:** `rag-chatbot`
   - **Dimensions:** `384`
   - **Metric:** `cosine`
4. Copy your API key to `.env`

### Step 4 — Express Server Setup

```bash
cd server
npm install
```

### Step 5 — Frontend Setup

```bash
cd frontend
npm install
```

---

## ▶️ Running the Project

You need **3 terminals** running simultaneously:

### Terminal 1 — FastAPI Backend
```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```
Runs on: `http://localhost:8000`

### Terminal 2 — Express Middleware
```bash
cd server
npm run dev
```
Runs on: `http://localhost:5000`

### Terminal 3 — React Frontend
```bash
cd frontend
npm start
```
Runs on: `http://localhost:3000`

### ⚡ One-Click Start (Windows only)
Double click `start.bat` to open all 3 terminals automatically!

---

## 💻 How to Use

1. Open `http://localhost:3000` in your browser
2. Click **"Click to upload PDF"** in the sidebar
3. Select any PDF file
4. Click **"Upload & Index"**
5. Wait for ✅ **"Document indexed successfully!"**
6. Type your question in the chat box
7. Press **Enter** or click **Send**
8. Get accurate AI answers! 🎉

---

## 🔑 Environment Variables

| Variable | Description | Where to get |
|----------|-------------|--------------|
| `GROQ_API_KEY` | Groq API key for LLaMA | [console.groq.com](https://console.groq.com) |
| `PINECONE_API_KEY` | Pinecone API key | [app.pinecone.io](https://app.pinecone.io) |
| `PINECONE_INDEX` | Pinecone index name | Create in Pinecone dashboard |

---

## 🐛 Common Issues & Fixes

### ❌ "No module named 'fastapi'"
```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

### ❌ "Collection not found" or empty answers
- Make sure PDF is fully indexed (wait for ✅ green message)
- Don't ask questions while indexing is in progress

### ❌ "Model decommissioned" error
Update model in `rag_pipeline.py`:
```python
model="llama-3.3-70b-versatile"
```

### ❌ Express upload not working
```bash
cd server
npm install multer form-data
npm install -D @types/multer
```

---

## 🗺️ Roadmap

## 🗺️ Roadmap

- [x] PDF upload and indexing
- [x] RAG pipeline
- [x] Glassmorphism UI
- [x] Typing animation
- [x] Pinecone cloud vector DB
- [x] HuggingFace API embeddings
- [x] Express middleware layer
- [x] Mobile friendly UI
- [ ] Deploy to Vercel + Render
- [ ] Multiple PDF support
- [ ] Chat history
- [ ] User authentication
- [ ] Support for Word docs and images
- [ ] Dark/Light mode toggle
---

## 👨‍💻 Author

**Aman Ansari**
Software Engineer | Full Stack | AI/ML

- 🔗 LinkedIn: [Aman Ansari](https://linkedin.com/in/aman-ansari)
- 🐙 GitHub: [@Aman-1603](https://github.com/Aman-1603)

---

## 📄 License

This project is licensed under the MIT License.

---

⭐ **If you found this helpful, please give it a star on GitHub!**
