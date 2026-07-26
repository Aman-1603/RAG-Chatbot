@echo off
start cmd /k "cd /d C:\Users\ASUS\Desktop\Projects\rag-chatbot\backend && venv\Scripts\activate && uvicorn main:app --reload"
start cmd /k "cd /d C:\Users\ASUS\Desktop\Projects\rag-chatbot\server && npm run dev"
start cmd /k "cd /d C:\Users\ASUS\Desktop\Projects\rag-chatbot\frontend && npm start"