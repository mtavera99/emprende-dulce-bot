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

js_attach = """
(() => {
    const input = document.querySelector('#main footer input[type="file"]');
    if (!input) return JSON.stringify({ error: "no input" });
    if (!window.__loaded_file) return JSON.stringify({ error: "no loaded file" });
    
    // Save original accept
    input.accept = "*";
    
    const dt = new DataTransfer();
    dt.items.add(window.__loaded_file);
    input.files = dt.files;
    
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    
    return JSON.stringify({ success: true, filesCount: input.files.length });
})()
"""
print(run_js(js_attach))
time.sleep(2)

js_dialog = """
(() => {
    const dialogs = Array.from(document.querySelectorAll('[role="dialog"], [data-animate-modal-popup="true"]'));
    const sendBtns = Array.from(document.querySelectorAll('span[data-icon="send"], div[aria-label="Enviar"], button[aria-label="Enviar"], span[data-icon="wds-ic-send-filled"]'));
    const previews = Array.from(document.querySelectorAll('[data-testid*="preview"], [data-testid*="media"], [data-testid*="document"]'));

    return JSON.stringify({
        dialogCount: dialogs.length,
        dialogTexts: dialogs.map(d => d.innerText.substring(0, 100)),
        sendBtnsCount: sendBtns.length,
        previewsCount: previews.length,
        previews: previews.map(p => ({ testId: p.getAttribute('data-testid'), text: p.innerText.substring(0, 50) }))
    });
})()
"""
print(run_js(js_dialog))
