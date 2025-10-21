import fitz
from docx import Document

def extract_text_from_pdf(file_stream):
    try:
        text = ""
        # Open the PDF directly from the byte stream
        with fitz.open(stream=file_stream, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text()
        return text
    except Exception as e:
        print(f"Error processing PDF: {e}")
        return ""

def extract_text_from_docx(file_stream):
    try:
        doc = Document(file_stream)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
    except Exception as e:
        print(f"Error processing DOCX: {e}")
        return ""