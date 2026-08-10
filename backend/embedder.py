import os
import requests
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"

def get_embeddings(texts: list[str]) -> list[list[float]]:
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    response = requests.post(
        API_URL,
        headers=headers,
        json={"inputs": texts, "options": {"wait_for_model": True}},
        timeout=60
    )
    return response.json()

def embed_chunks(chunks: list[dict]) -> list[dict]:
    texts = [chunk["text"] for chunk in chunks]
    print(f"Embedding {len(texts)} chunks via HuggingFace API...")

    all_embeddings = []
    for i in range(0, len(texts), 16):
        batch = texts[i:i + 16]
        all_embeddings.extend(get_embeddings(batch))

    for i, chunk in enumerate(chunks):
        chunk["embedding"] = all_embeddings[i]

    print("Embedding done ✅")
    return chunks

def embed_text(text: str) -> list[float]:
    return get_embeddings([text])[0]

# What this does:

# ["chunk1 text", "chunk2 text", "chunk3 text"]
#             ↓  sentence-transformers
# [[0.23, 0.11, ...], [0.45, 0.32, ...], ...]

# Converts text into numbers (vectors) so we can do similarity search later!