import subprocess
import json
import time

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

js_close = """
(() => {
    // Look for close button in the media editor modal
    const closeBtn = document.querySelector('div[aria-label="Cerrar"]') || 
                     document.querySelector('button[aria-label="Cerrar"]') ||
                     document.querySelector('[data-testid="x-viewer"]') ||
                     document.querySelector('[data-icon="x"]');
    
    if (closeBtn) {
        closeBtn.click();
        return "clicked closeBtn";
    }
    
    // Or dispatch escape key
    const escEvt = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true });
    document.dispatchEvent(escEvt);
    return "dispatched escape";
})()
"""
print(run_js(js_close))
time.sleep(1)

js_check = """
(() => {
    const thumbs = document.querySelectorAll('[data-testid="media-editor-attachment-thumb"]');
    return JSON.stringify({ inModal: thumbs.length > 0 });
})()
"""
print(run_js(js_check))
