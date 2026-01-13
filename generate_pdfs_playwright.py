import asyncio
from playwright.async_api import async_playwright

async def generate_pdfs():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        
        files = [
            ('http://localhost:3000/speaker-onesheet.html', '/app/frontend/public/pdfs/Chelsea-Flynn-Speaker-OneSheet.pdf'),
            ('http://localhost:3000/keynote-guide.html', '/app/frontend/public/pdfs/Boundaries-Burnout-Keynote-Guide.pdf'),
            ('http://localhost:3000/keynote-slides.html', '/app/frontend/public/pdfs/Boundaries-Burnout-Slides.pdf'),
        ]
        
        for url, output_path in files:
            try:
                print(f"Converting {url}...")
                page = await browser.new_page()
                await page.goto(url, wait_until='networkidle')
                await page.wait_for_timeout(2000)
                await page.pdf(path=output_path, format='Letter', print_background=True)
                await page.close()
                print(f"✓ Saved: {output_path}")
            except Exception as e:
                print(f"✗ Error with {url}: {e}")
        
        await browser.close()
        print("\nDone! PDFs created.")

asyncio.run(generate_pdfs())
