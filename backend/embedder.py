from sentence_transformers import SentenceTransformer

# Use smaller, lighter model
model = SentenceTransformer('all-MiniLM-L6-v2', device='cpu')

def embed_chunks(chunks: list[dict]) -> list[dict]:
    """
    Takes chunks from chunker.py and adds embeddings to each chunk.
    """
    texts = [chunk["text"] for chunk in chunks]
    
    print(f"Embedding {len(texts)} chunks...")
    embeddings = model.encode(
        texts,
        show_progress_bar=True,
        batch_size=8  # smaller batch = less memory
    )
    
    for i, chunk in enumerate(chunks):
        chunk["embedding"] = embeddings[i].tolist()
    
    print("Embedding done ✅")
    return chunks


# What this does:

# ["chunk1 text", "chunk2 text", "chunk3 text"]
#             ↓  sentence-transformers
# [[0.23, 0.11, ...], [0.45, 0.32, ...], ...]

# Converts text into numbers (vectors) so we can do similarity search later!