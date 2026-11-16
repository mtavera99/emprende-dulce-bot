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
    const rows = Array.from(document.querySelectorAll('[data-testid*="message"], [class*="messageRow"], [class*="chatMessage"]'));
    const stopBtn = document.querySelector('button[aria-label*="Stop"], button[title*="Stop"]');
    
    // Also check last user message in the thread
    const userMsgs = Array.from(document.querySelectorAll('[data-role="user"], [class*="userMessage"]'));

    return JSON.stringify({
        isGenerating: !!stopBtn,
        rowCount: rows.length,
        userMsgCount: userMsgs.length,
        lastUserMsg: userMsgs.length > 0 ? userMsgs[userMsgs.length - 1].innerText.substring(0, 150) : null
    });
})()
"""
print(run_js(js))
