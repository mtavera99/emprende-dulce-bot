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
    const prose = Array.from(document.querySelectorAll('.prose, [class*="prose"], [class*="markdown"]'));
    if (prose.length === 0) return "no prose";
    const text = prose[prose.length - 1].innerText;
    // Find where ".pc-arco.foto img" starts and get next 4000 chars
    const idx = text.indexOf('.pc-arco.foto img');
    return idx !== -1 ? text.substring(idx) : text.substring(text.length - 3000);
})()
"""
output = run_js(js)
print(output)
