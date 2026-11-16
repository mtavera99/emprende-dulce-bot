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
    const app = document.querySelector('#app') || document.querySelector('#root') || document.body.firstElementChild;
    return JSON.stringify({
        appId: app ? app.id : null,
        props: Object.getOwnPropertyNames(app || {}),
        symbols: Object.getOwnPropertySymbols(app || {}).map(s => s.toString())
    });
})()
"""
print(run_js(js))
