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
    // Get all text nodes or headings in the last message container
    const all = Array.from(document.querySelectorAll('[data-role="assistant"], [class*="assistant"]'));
    if (all.length === 0) return "no assistant elements";
    const last = all[all.length - 1];
    return JSON.stringify({
        text: last.innerText.substring(0, 1000),
        fullLength: last.innerText.length
    });
})()
"""
print(run_js(js))
