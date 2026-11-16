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

js = """
(() => {
    // Find remove buttons on thumbs
    const removeBtns = Array.from(document.querySelectorAll('div[aria-label="Quitar archivo adjunto"]'));
    removeBtns.forEach(b => b.click());
    
    // Also check for top close button
    const closeBtns = Array.from(document.querySelectorAll('[aria-label="Cerrar"], [data-icon="x"]'));
    closeBtns.forEach(b => b.click());

    return JSON.stringify({
        removedCount: removeBtns.length,
        closedCount: closeBtns.length
    });
})()
"""
print(run_js(js))
time.sleep(1)

js_check = """
(() => {
    const thumbs = document.querySelectorAll('[data-testid="media-editor-attachment-thumb"]');
    return JSON.stringify({ inModal: thumbs.length > 0 });
})()
"""
print(run_js(js_check))
