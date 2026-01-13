#!/usr/bin/env python3
import os
from weasyprint import HTML, CSS
import requests

# Create PDFs directory
os.makedirs('/app/frontend/public/pdfs', exist_ok=True)

# URLs to convert
files = [
    ('http://localhost:3000/speaker-onesheet.html', '/app/frontend/public/pdfs/Chelsea-Flynn-Speaker-OneSheet.pdf'),
    ('http://localhost:3000/keynote-guide.html', '/app/frontend/public/pdfs/Boundaries-Burnout-Keynote-Guide.pdf'),
    ('http://localhost:3000/keynote-slides.html', '/app/frontend/public/pdfs/Boundaries-Burnout-Slides.pdf'),
]

for url, output_path in files:
    try:
        print(f"Converting {url}...")
        HTML(url=url).write_pdf(output_path)
        print(f"✓ Saved: {output_path}")
    except Exception as e:
        print(f"✗ Error with {url}: {e}")

print("\nDone! PDFs created.")
