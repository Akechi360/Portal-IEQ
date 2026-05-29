import pypdf
import os

pdf_path = os.path.join(os.path.dirname(__file__), '..', 'Ruijie Cloud API Reference Manual V2.pdf')
reader = pypdf.PdfReader(pdf_path)

for p in [11, 12, 13]:
    print(f"\n=== PAGE {p + 1} ===")
    print(reader.pages[p].extract_text())
