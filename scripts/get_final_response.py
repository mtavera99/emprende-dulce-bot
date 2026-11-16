import subprocess
import json
import time

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
    const prose = Array.from(document.querySelectorAll('.prose, [class*="prose"], [class*="markdown"]'));
    if (prose.length === 0) return "no prose";
    return prose[prose.length - 1].innerText;
})()
"""
output = run_js(js)
print("=== OPUS 5.5 RESPONSE ===")
print(output)
