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
    const main = document.querySelector('#main');
    const attachBtn = main ? (
        main.querySelector('button[aria-label="Adjuntar"]') ||
        main.querySelector('div[aria-label="Adjuntar"]') ||
        main.querySelector('span[data-icon="plus"]') ||
        main.querySelector('span[data-icon="attach-menu-plus"]') ||
        main.querySelector('button[title="Adjuntar"]')
    ) : null;

    return JSON.stringify({
        hasAttachBtn: !!attachBtn,
        tag: attachBtn ? attachBtn.tagName : null,
        ariaLabel: attachBtn ? attachBtn.getAttribute('aria-label') : null,
        className: attachBtn ? attachBtn.className : null
    });
})()
"""
print(run_js(js))
