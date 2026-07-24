from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_pages(pages: list[dict]) -> list[dict]:
    """
    Takes pages from pdf_loader and splits into smaller chunks.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ". ", " ", ""]
    )

    all_chunks = []

    for page in pages:
        chunks = splitter.split_text(page["text"])
        for i, chunk in enumerate(chunks):
            all_chunks.append({
                "chunk_index": i,
                "page_number": page["page_number"],
                "text": chunk
            })

    print(f"Created {len(all_chunks)} chunks")
    return all_chunks