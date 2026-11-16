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
    const all = Array.from(document.querySelectorAll('[data-role="assistant"], [class*="assistant"]'));
    const last = all[all.length - 1];
    
    // Check if Stop button is still present
    const stopBtn = document.querySelector('button[aria-label*="Stop"], button[title*="Stop"]');
    
    return JSON.stringify({
        isGenerating: !!stopBtn,
        innerText: last.innerText,
        htmlSnippet: last.outerHTML.substring(0, 500)
    });
})()
"""
print(run_js(js))
