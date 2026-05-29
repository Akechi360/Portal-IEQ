import pypdf
import os

pdf_path = os.path.join(os.path.dirname(__file__), '..', 'Ruijie Cloud API Reference Manual V2.pdf')
reader = pypdf.PdfReader(pdf_path)

for idx, page in enumerate(reader.pages):
    text = page.extract_text()
    if 'voucher' in text.lower():
        print(f"Page {idx + 1} contains 'voucher':")
        for line in text.split('\n'):
            if 'voucher' in line.lower() or 'create' in line.lower() or 'customer' in line.lower():
                print(f"  {line.strip()[:100]}")
