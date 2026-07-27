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
        timeout=30
    )
    return response.json()

def embed_chunks(chunks: list[dict]) -> list[dict]:
    # Try HuggingFace API first, fall back to local
    try:
        texts = [chunk["text"] for chunk in chunks]
        print(f"Embedding {len(texts)} chunks via HuggingFace API...")
        batch_size = 32
        all_embeddings = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            embeddings = get_embeddings(batch)
            all_embeddings.extend(embeddings)
        for i, chunk in enumerate(chunks):
            chunk["embedding"] = all_embeddings[i]
        print("Embedding done via API ✅")
    except Exception as e:
        print(f"API failed: {e} — falling back to local model...")
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('all-MiniLM-L6-v2')
        texts = [chunk["text"] for chunk in chunks]
        embeddings = model.encode(texts, show_progress_bar=True)
        for i, chunk in enumerate(chunks):
            chunk["embedding"] = embeddings[i].tolist()
        print("Embedding done via local model ✅")
    return chunks

def embed_text(text: str) -> list[float]:
    try:
        return get_embeddings([text])[0]
    except Exception:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('all-MiniLM-L6-v2')
        return model.encode(text).tolist()

# What this does:

# ["chunk1 text", "chunk2 text", "chunk3 text"]
#             ↓  sentence-transformers
# [[0.23, 0.11, ...], [0.45, 0.32, ...], ...]

# Converts text into numbers (vectors) so we can do similarity search later!