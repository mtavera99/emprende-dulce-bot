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
    let pickerCalled = false;
    let pickerArgs = null;
    const origPicker = window.showOpenFilePicker;
    if (window.showOpenFilePicker) {
        window.showOpenFilePicker = async function(...args) {
            pickerCalled = true;
            pickerArgs = args;
            throw new Error("intercepted");
        };
    }
    
    // First make sure menu is open
    let docBtn = document.querySelector('button[aria-label="Documento"]');
    if (!docBtn) {
        const attachBtn = document.querySelector('button[aria-label="Adjuntar"]');
        if (attachBtn) attachBtn.click();
    }
    
    docBtn = document.querySelector('button[aria-label="Documento"]');
    if (docBtn) {
        docBtn.click();
    }
    
    if (origPicker) window.showOpenFilePicker = origPicker;
    
    return JSON.stringify({
        hasShowOpenFilePicker: !!origPicker,
        pickerCalled,
        pickerArgs
    });
})()
"""
print(run_js(js))
