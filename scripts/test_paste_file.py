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

js_paste = """
(() => {
    const composeBox = document.querySelector('div[contenteditable="true"][data-testid="conversation-compose-box-input"]') || 
                       document.querySelector('footer div[contenteditable="true"]');
    if (!composeBox) return JSON.stringify({ error: "no compose box" });
    if (!window.__loaded_file) return JSON.stringify({ error: "no loaded file" });
    
    composeBox.focus();
    
    const dt = new DataTransfer();
    dt.items.add(window.__loaded_file);
    
    const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: dt,
        bubbles: true,
        cancelable: true
    });
    
    const dispatched = composeBox.dispatchEvent(pasteEvent);
    return JSON.stringify({ dispatched, fileName: window.__loaded_file.name });
})()
"""
print("Paste result:", run_js(js_paste))
time.sleep(2)

js_check = """
(() => {
    const sendBtns = Array.from(document.querySelectorAll('span[data-icon="send"], div[aria-label="Enviar"], button[aria-label="Enviar"], span[data-icon="wds-ic-send-filled"]'));
    const modals = Array.from(document.querySelectorAll('[data-animate-modal-popup="true"], [role="dialog"], [data-testid*="popup"]'));
    const bodyText = document.body.innerText;
    const hasFileName = bodyText.includes('01_Helados_Artesanales_Guia_Maestra.pdf') || bodyText.includes('01_Helados');
    
    return JSON.stringify({
        hasFileName,
        sendBtnsCount: sendBtns.length,
        modalsCount: modals.length,
        modalsText: modals.map(m => m.innerText.substring(0, 100)),
        composeText: (document.querySelector('footer div[contenteditable="true"]') || {}).innerText
    });
})()
"""
print("Check state after paste:", run_js(js_check))
