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
    const all = Array.from(document.querySelectorAll('*'));
    const docItem = all.find(el => el.innerText && el.innerText.trim() === 'Documento');
    if (!docItem) return "Documento not found";
    
    // Check parent tree
    let p = docItem;
    let parents = [];
    while (p && parents.length < 5) {
        parents.push({
            tag: p.tagName,
            role: p.getAttribute('role'),
            className: p.className,
            html: p.outerHTML.substring(0, 300)
        });
        const fileInput = p.querySelector('input[type="file"]');
        if (fileInput) {
            return JSON.stringify({
                foundInput: true,
                inputHtml: fileInput.outerHTML,
                accept: fileInput.getAttribute('accept'),
                parents
            });
        }
        p = p.parentElement;
    }
    
    // Also check all inputs anywhere
    const inputs = Array.from(document.querySelectorAll('input[type="file"]')).map(i => ({
        accept: i.getAttribute('accept'),
        style: i.getAttribute('style'),
        parentTag: i.parentElement ? i.parentElement.tagName : null
    }));

    return JSON.stringify({ foundInput: false, inputs, parents });
})()
"""
print(run_js(js))
