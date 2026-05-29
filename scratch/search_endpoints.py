import pypdf
import os
import re

pdf_path = os.path.join(os.path.dirname(__file__), '..', 'Ruijie Cloud API Reference Manual V2.pdf')
reader = pypdf.PdfReader(pdf_path)

keywords = ['customerCreate', 'usergroup', 'oauth20', 'voucher', 'device', 'session', 'sta_users', 'networkgroup']

print(f"Total pages: {len(reader.pages)}")

for idx, page in enumerate(reader.pages):
    text = page.extract_text()
    found = []
    for kw in keywords:
        if kw.lower() in text.lower():
            found.append(kw)
    if found:
        print(f"Page {idx + 1} matches keywords: {found}")
        # Print lines that contain any of the keywords
        for line in text.split('\n'):
            for kw in found:
                if kw.lower() in line.lower():
                    print(f"  [{kw}] -> {line.strip()[:120]}")
                    break
