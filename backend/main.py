from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os

from rag_pipeline import ingest_pdf, ask_question

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    question: str
    collection_name: str = "default"

@app.get("/")
def root():
    return {"message": "RAG Chatbot API is running!"}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    chunks = ingest_pdf(temp_path)
    os.remove(temp_path)
    
    return {"message": "PDF uploaded successfully!", "chunks": chunks}

@app.post("/ask")
def ask(req: QuestionRequest):
    answer = ask_question(req.question, req.collection_name)
    return {"answer": answer}