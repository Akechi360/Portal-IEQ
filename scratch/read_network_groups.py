import pypdf
import os

pdf_path = os.path.join(os.path.dirname(__file__), '..', 'Ruijie Cloud API Reference Manual V2.pdf')
reader = pypdf.PdfReader(pdf_path)

for idx, page in enumerate(reader.pages):
    text = page.extract_text()
    if 'network group list' in text.lower() or '2.2.1' in text.lower() or 'network/list' in text.lower():
        print(f"Page {idx + 1} matches:")
        for line in text.split('\n'):
            if 'list' in line.lower() or 'url' in line.lower() or 'get' in line.lower():
                print(f"  {line.strip()[:100]}")
