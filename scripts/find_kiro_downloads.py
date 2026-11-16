import subprocess
import json

def run_js(js_code):
    as_script = f'''
tell application "Google Chrome"
    tell tab 5 of window 1
        execute javascript {json.dumps(js_code)}
    end tell
end tell
'''
    res = subprocess.run(["osascript", "-e", as_script], capture_output=True, text=True)
    return res.stdout.strip()

js = """
(() => {
    // Find all links or buttons with download attributes
    const links = Array.from(document.querySelectorAll('a[download], a[href*="download"], [class*="download"], button[aria-label*="Descargar"], button[title*="Descargar"]'));
    const files = Array.from(document.querySelectorAll('[data-testid*="file"], [class*="file-item"], [class*="attachment"]'));

    return JSON.stringify({
        links: links.map(l => ({ text: l.innerText, href: l.href, download: l.getAttribute('download') })),
        files: files.map(f => f.innerText)
    });
})()
"""
print(run_js(js))
