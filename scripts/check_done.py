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
    const stopBtn = document.querySelector('button[aria-label*="Stop"], button[title*="Stop"]');
    const prose = Array.from(document.querySelectorAll('.prose, [class*="prose"], [class*="markdown"]'));
    const lastMsg = prose.length > 0 ? prose[prose.length - 1].innerText : "";
    return JSON.stringify({
        isGenerating: !!stopBtn,
        length: lastMsg.length,
        hasNewMessage: lastMsg.length > 4320,
        preview: lastMsg.substring(0, 300)
    });
})()
"""
print(run_js(js))
