import subprocess
import json

def run_js(js_code):
    as_script = f'''
tell application "Google Chrome"
    tell tab 8 of window 1
        execute javascript {json.dumps(js_code)}
    end tell
end tell
'''
    res = subprocess.run(["osascript", "-e", as_script], capture_output=True, text=True)
    return res.stdout.strip()

js = """
(() => {
    const spans = Array.from(document.querySelectorAll('span')).filter(s => s.innerText && s.innerText.includes('01_Helados'));
    return JSON.stringify(spans.map(s => ({
        tag: s.tagName,
        text: s.innerText,
        html: s.outerHTML,
        parentHtml: s.parentElement ? s.parentElement.outerHTML.substring(0, 300) : null
    })));
})()
"""
print(run_js(js))
