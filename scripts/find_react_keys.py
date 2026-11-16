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
    const docBtn = document.querySelector('button[aria-label="Documento"]');
    if (!docBtn) return "no docBtn";

    let keys = [];
    for (let k in docBtn) {
        if (k.startsWith('__react')) {
            keys.push(k);
        }
    }
    
    // Also check parent
    let p = docBtn.parentElement;
    let parentKeys = [];
    while (p && parentKeys.length < 5) {
        for (let k in p) {
            if (k.startsWith('__react') && !parentKeys.includes(k)) {
                parentKeys.push(k);
            }
        }
        p = p.parentElement;
    }

    return JSON.stringify({ keys, parentKeys });
})()
"""
print(run_js(js))
