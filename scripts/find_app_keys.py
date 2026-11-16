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
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const standardKeys = new Set(Object.keys(iframe.contentWindow));
    document.body.removeChild(iframe);

    const appKeys = Object.keys(window).filter(k => !standardKeys.has(k));
    return JSON.stringify(appKeys);
})()
"""
print(run_js(js))
