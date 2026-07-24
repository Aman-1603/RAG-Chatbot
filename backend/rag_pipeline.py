from pdf_loader import load_pdf
from chunker import chunk_pages
from embedder import embed_chunks, model
from vector_store import save_chunks, search_chunks
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def ingest_pdf(file_path: str, collection_name: str = "default"):
    """
    Full pipeline: PDF → chunks → embeddings → ChromaDB
    """
    print("Step 1: Loading PDF...")
    pages = load_pdf(file_path)

    print("Step 2: Chunking...")
    chunks = chunk_pages(pages)

    print("Step 3: Embedding...")
    chunks = embed_chunks(chunks)

    print("Step 4: Saving to ChromaDB...")
    save_chunks(chunks, collection_name)

    print("✅ PDF ingested successfully!")
    return len(chunks)


def ask_question(question: str, collection_name: str = "default"):
    """
    Full pipeline: question → embed → search → Groq answer
    """
    print("Embedding question...")
    question_embedding = model.encode(question).tolist()

    print("Searching ChromaDB...")
    relevant_chunks = search_chunks(question_embedding, collection_name)

    context = "\n\n".join(relevant_chunks)

    print("Asking Groq...")
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {
                "role": "system",
                "content": "Answer questions based only on the provided context."
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {question}"
            }
        ]
    )

    return response.choices[0].message.content


# This will help me to donme connects everything:

# PDF → load → chunk → embed → save to ChromaDB
# Question → embed → search ChromaDB → Groq answers