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
    const footer = document.querySelector('#main footer');
    if (!footer) return "no footer";
    
    // Find all inputs, buttons, and contenteditable elements
    const interactive = Array.from(footer.querySelectorAll('input, button, [contenteditable]'));
    return JSON.stringify(interactive.map(el => ({
        tag: el.tagName,
        type: el.type,
        accept: el.getAttribute('accept'),
        ariaLabel: el.getAttribute('aria-label'),
        title: el.getAttribute('title'),
        html: el.outerHTML.substring(0, 150)
    })));
})()
"""
print(run_js(js))
