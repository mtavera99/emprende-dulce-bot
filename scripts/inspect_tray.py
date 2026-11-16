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
    // Find all thumbs in the media editor attachment tray
    const thumbs = Array.from(document.querySelectorAll('[data-testid="media-editor-attachment-thumb"]'));
    const sendBtn = document.querySelector('div[role="button"][aria-label^="Enviar"]');
    
    return JSON.stringify({
        thumbCount: thumbs.length,
        thumbs: thumbs.map(t => ({
            label: t.getAttribute('aria-label'),
            pos: t.getAttribute('aria-posinset'),
            total: t.getAttribute('aria-setsize')
        })),
        sendBtnAriaLabel: sendBtn ? sendBtn.getAttribute('aria-label') : null
    });
})()
"""
print(run_js(js))
