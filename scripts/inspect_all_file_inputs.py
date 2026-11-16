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
    const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
    return JSON.stringify(fileInputs.map((inp, idx) => {
        let p = inp.parentElement;
        let path = [];
        while (p && p !== document.body) {
            path.push(p.tagName + (p.id ? '#' + p.id : '') + (p.getAttribute('aria-label') ? '[' + p.getAttribute('aria-label') + ']' : '') + (p.getAttribute('data-testid') ? '{' + p.getAttribute('data-testid') + '}' : ''));
            p = p.parentElement;
        }
        return {
            idx,
            accept: inp.getAttribute('accept'),
            multiple: inp.multiple,
            path: path.reverse().join(' > ')
        };
    }));
})()
"""
print(run_js(js))
