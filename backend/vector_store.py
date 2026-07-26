import os
from pinecone import Pinecone
from dotenv import load_dotenv

load_dotenv()

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX"))


def save_chunks(chunks: list[dict], collection_name: str = "default"):
    """
    Saves embedded chunks into Pinecone.
    """
    vectors = []
    for i, chunk in enumerate(chunks):
        vectors.append({
            "id": f"{collection_name}-{i}",
            "values": chunk["embedding"],
            "metadata": {
                "text": chunk["text"],
                "page_number": chunk["page_number"],
                "collection": collection_name
            }
        })

    # Upsert in batches of 100
    batch_size = 100
    for i in range(0, len(vectors), batch_size):
        batch = vectors[i:i + batch_size]
        index.upsert(vectors=batch)

    print(f"Saved {len(chunks)} chunks to Pinecone ✅")


def search_chunks(query_embedding: list, collection_name: str = "default", top_k: int = 4):
    """
    Searches Pinecone for most similar chunks to the query.
    """
    results = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True,
        filter={"collection": {"$eq": collection_name}}
    )

    chunks = [match["metadata"]["text"] for match in results["matches"]]
    return chunks

# this will help me to ...............

# save_chunks → stores all chunks + embeddings in ChromaDB (like a database)
# search_chunks → finds the most similar chunks to your question