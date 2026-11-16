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
    const inputs = Array.from(document.querySelectorAll('input[type="file"]'));
    return JSON.stringify(inputs.map(inp => ({
        accept: inp.getAttribute('accept'),
        multiple: inp.multiple,
        name: inp.name,
        parent: inp.parentElement.tagName
    })));
})()
"""
print(run_js(js))
