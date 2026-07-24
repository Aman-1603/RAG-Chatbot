import chromadb

client = chromadb.PersistentClient(path="./chroma_db")

def save_chunks(chunks: list[dict], collection_name: str = "default"):
    """
    Saves embedded chunks into ChromaDB.
    """
    collection = client.get_or_create_collection(name=collection_name)

    ids = [str(i) for i in range(len(chunks))]
    embeddings = [chunk["embedding"] for chunk in chunks]
    documents = [chunk["text"] for chunk in chunks]
    metadatas = [{"page_number": chunk["page_number"]} for chunk in chunks]

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas
    )

    print(f"Saved {len(chunks)} chunks to ChromaDB ✅")


def search_chunks(query_embedding: list, collection_name: str = "default", top_k: int = 4):
    """
    Searches ChromaDB for most similar chunks to the query.
    """
    collection = client.get_or_create_collection(name=collection_name)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    return results["documents"][0]

# this will help me to ...............

# save_chunks → stores all chunks + embeddings in ChromaDB (like a database)
# search_chunks → finds the most similar chunks to your question