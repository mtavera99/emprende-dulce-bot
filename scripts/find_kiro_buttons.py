import subprocess
import json

def run_js(js_code):
    as_script = f'''
tell application "Google Chrome"
    tell tab 5 of window 1
        execute javascript {json.dumps(js_code)}
    end tell
end tell
'''
    res = subprocess.run(["osascript", "-e", as_script], capture_output=True, text=True)
    return res.stdout.strip()

js = """
(() => {
    const ta = document.querySelector('textarea');
    let p = ta;
    let found = [];
    while (p && p !== document.body) {
        const btns = p.querySelectorAll('button');
        if (btns.length > 0) {
            found.push({
                tag: p.tagName,
                className: p.className,
                btnCount: btns.length,
                btns: Array.from(btns).map(b => b.outerHTML.substring(0, 150))
            });
            if (found.length >= 2) break;
        }
        p = p.parentElement;
    }
    return JSON.stringify(found);
})()
"""
print(run_js(js))
