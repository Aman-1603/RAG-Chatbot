from pypdf import PdfReader

def load_pdf(file_path: str) -> list[dict]:
    """
    Reads a PDF and returns list of pages with text and page number.
    """
    reader = PdfReader(file_path)
    pages = []

    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text and text.strip():
            pages.append({
                "page_number": i + 1,
                "text": text.strip()
            })

    print(f"Extracted {len(pages)} pages from PDF")
    return pages


# this will extract all the text from the pages and give like this ......

# [
#   {"page_number": 1, "text": "..."},
#   {"page_number": 2, "text": "..."},
# ]