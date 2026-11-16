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
    // Intercept document.createElement('input') or HTMLInputElement.prototype.click
    let createdInputs = [];
    const origCreate = document.createElement;
    document.createElement = function(tag) {
        const el = origCreate.apply(this, arguments);
        if (tag.toLowerCase() === 'input') {
            createdInputs.push(el);
        }
        return el;
    };
    
    let clickedInputs = [];
    const origClick = HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click = function() {
        clickedInputs.push({
            accept: this.getAttribute('accept'),
            type: this.type,
            multiple: this.multiple
        });
        // Dont actually call origClick to prevent native dialog if intercepted!
    };
    
    const docBtn = document.querySelector('button[aria-label="Documento"]');
    if (docBtn) {
        docBtn.click();
    }
    
    // Restore
    document.createElement = origCreate;
    HTMLInputElement.prototype.click = origClick;
    
    return JSON.stringify({
        btnFound: !!docBtn,
        createdInputsCount: createdInputs.length,
        clickedInputs: clickedInputs
    });
})()
"""
print(run_js(js))
