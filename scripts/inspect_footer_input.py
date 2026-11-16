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
    const input = document.querySelector('#main footer input[type="file"]');
    if (!input) return "no input";
    
    // Check its properties, attributes, and parent elements
    let p = input;
    let parents = [];
    while (p && p.tagName !== 'FOOTER') {
        parents.push({
            tag: p.tagName,
            className: p.className,
            role: p.getAttribute('role'),
            ariaLabel: p.getAttribute('aria-label')
        });
        p = p.parentElement;
    }
    
    return JSON.stringify({
        accept: input.accept,
        multiple: input.multiple,
        parents
    });
})()
"""
print(run_js(js))
