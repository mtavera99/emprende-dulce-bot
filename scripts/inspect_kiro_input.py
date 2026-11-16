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
    // Find textarea or input for prompt in Kiro
    const ta = document.querySelector('textarea');
    const editable = document.querySelector('[contenteditable="true"]');
    const input = ta || editable;
    
    // Find send button
    const buttons = Array.from(document.querySelectorAll('button'));
    const sendBtn = buttons.find(b => 
        b.getAttribute('aria-label') === 'Send' || 
        b.getAttribute('title') === 'Send' ||
        b.querySelector('svg title')?.textContent === 'Send' ||
        b.querySelector('svg')?.classList.contains('lucide-send') ||
        b.querySelector('svg')?.getAttribute('data-icon') === 'send'
    ) || buttons.filter(b => b.innerText.toLowerCase().includes('send')).pop();

    return JSON.stringify({
        hasInput: !!input,
        inputType: ta ? 'textarea' : (editable ? 'contenteditable' : 'none'),
        inputPlaceholder: input ? (input.placeholder || input.getAttribute('placeholder')) : null,
        sendBtnFound: !!sendBtn,
        sendBtnHtml: sendBtn ? sendBtn.outerHTML.substring(0, 150) : null
    });
})()
"""
print(run_js(js))
