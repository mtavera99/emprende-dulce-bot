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
    // Open attach menu if not open
    let menu = document.querySelector('div[role="menu"]');
    if (!menu) {
        const attachBtn = document.querySelector('button[aria-label="Adjuntar"]');
        if (attachBtn) attachBtn.click();
    }
    menu = document.querySelector('div[role="menu"]');
    if (!menu) return "no menu";

    // Get all buttons and their html
    const items = Array.from(menu.querySelectorAll('button, li, [role="menuitem"]'));
    return JSON.stringify(items.map(it => ({
        tag: it.tagName,
        ariaLabel: it.getAttribute('aria-label'),
        text: it.innerText.trim(),
        html: it.outerHTML
    })));
})()
"""
print(run_js(js))
