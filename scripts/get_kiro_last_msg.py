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
    // Find all message containers
    const messages = Array.from(document.querySelectorAll('.prose, [class*="prose"], [class*="markdown"]'));
    if (messages.length === 0) return "no prose found";
    const last = messages[messages.length - 1];
    return last.innerText;
})()
"""
print(run_js(js))
