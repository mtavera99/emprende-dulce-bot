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
    const inputs = Array.from(document.querySelectorAll('input'));
    return JSON.stringify(inputs.map(inp => ({
        type: inp.type,
        accept: inp.getAttribute('accept'),
        name: inp.name,
        className: inp.className,
        style: inp.getAttribute('style'),
        parent: inp.parentElement ? inp.parentElement.tagName : null,
        parentClass: inp.parentElement ? inp.parentElement.className : null
    })));
})()
"""
print(run_js(js))
