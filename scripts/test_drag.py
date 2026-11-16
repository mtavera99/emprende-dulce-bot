import subprocess
import json
import base64

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
    // Check what happens on dragenter / dragover
    const main = document.querySelector('#main') || document.body;
    const dt = new DataTransfer();
    
    // Create a dummy file
    const file = new File(["dummy content"], "test.pdf", { type: "application/pdf" });
    dt.items.add(file);
    
    const dragEnterEvt = new DragEvent('dragenter', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dt
    });
    const dragOverEvt = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dt
    });
    
    main.dispatchEvent(dragEnterEvt);
    main.dispatchEvent(dragOverEvt);
    
    // Check if any overlay appeared
    return JSON.stringify({
        mainHasListeners: true,
        overlays: Array.from(document.querySelectorAll('[data-testid*="drop"], [class*="drop"]')).map(el => el.className)
    });
})()
"""
print(run_js(js))
