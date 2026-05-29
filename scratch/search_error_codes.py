import pypdf
import os

pdf_path = os.path.join(os.path.dirname(__file__), '..', 'Ruijie Cloud API Reference Manual V2.pdf')
reader = pypdf.PdfReader(pdf_path)

for idx, page in enumerate(reader.pages):
    text = page.extract_text()
    if '2015' in text or 'group does not exist' in text.lower():
        print(f"Page {idx + 1} matches:")
        for line in text.split('\n'):
            if '2015' in line or 'exist' in line.lower() or 'group' in line.lower():
                print(f"  {line.strip()[:100]}")
