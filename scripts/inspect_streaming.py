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
    // Find streaming container or last text node in chat
    const allDivs = Array.from(document.querySelectorAll('div, p, span'));
    const stopBtn = document.querySelector('button[aria-label*="Stop"], button[title*="Stop"]');
    
    // Look for tool logs or thinking
    const toolOutput = Array.from(document.querySelectorAll('[class*="tool"], [class*="output"], [class*="terminal"], [class*="code"]'));

    return JSON.stringify({
        isGenerating: !!stopBtn,
        stopBtnText: stopBtn ? stopBtn.innerText : null,
        toolOutputsCount: toolOutput.length,
        lastToolOutputs: toolOutput.slice(-3).map(t => t.innerText.substring(0, 100))
    });
})()
"""
print(run_js(js))
