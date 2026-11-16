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
    // Check if there is an active generation or if Kiro is idle
    const stopBtn = document.querySelector('button[aria-label*="Stop"], button[title*="Stop"]');
    
    // Find textarea or input for prompt
    const textarea = document.querySelector('textarea, div[contenteditable="true"]');
    
    // Get last assistant message
    const msgs = Array.from(document.querySelectorAll('[data-role="assistant"], [class*="assistant"], [class*="message"]'));
    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].innerText.substring(0, 300) : "";

    return JSON.stringify({
        hasStopBtn: !!stopBtn,
        hasTextarea: !!textarea,
        textareaPlaceholder: textarea ? (textarea.placeholder || textarea.getAttribute('aria-label')) : null,
        lastMsgPreview: lastMsg
    });
})()
"""
print(run_js(js))
