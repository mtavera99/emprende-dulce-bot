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
    const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
    if (!window.__loaded_file) return JSON.stringify({ error: "no loaded file" });

    const results = [];
    fileInputs.forEach((inp, idx) => {
        try {
            const dt = new DataTransfer();
            dt.items.add(window.__loaded_file);
            inp.files = dt.files;
            
            // Dispatch standard input/change
            inp.dispatchEvent(new Event('input', { bubbles: true }));
            inp.dispatchEvent(new Event('change', { bubbles: true }));
            
            results.push({ idx, success: true, filesCount: inp.files.length });
        } catch (e) {
            results.push({ idx, error: e.toString() });
        }
    });

    return JSON.stringify(results);
})()
"""
print("Assigning to all inputs:", run_js(js))
time.sleep(2)

js_check = """
(() => {
    // Check if any dialog, popup, or send button appeared
    const sendBtns = Array.from(document.querySelectorAll('span[data-icon="send"], div[aria-label="Enviar"], button[aria-label="Enviar"], span[data-icon="wds-ic-send-filled"]'));
    const modals = Array.from(document.querySelectorAll('[data-animate-modal-popup="true"], [role="dialog"], [data-testid*="popup"]'));
    
    // Check if filename appears anywhere in the body
    const bodyText = document.body.innerText;
    const hasFileName = bodyText.includes('01_Helados_Artesanales_Guia_Maestra.pdf') || bodyText.includes('01_Helados');
    
    return JSON.stringify({
        hasFileName,
        sendBtnsCount: sendBtns.length,
        modalsCount: modals.length,
        modalsText: modals.map(m => m.innerText.substring(0, 100))
    });
})()
"""
print("Check state:", run_js(js_check))
