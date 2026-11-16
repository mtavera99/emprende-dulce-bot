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
    // Find all tool invocation summaries in Kiro
    const toolEls = Array.from(document.querySelectorAll('[class*="toolCall"], [class*="ToolCall"], [class*="actionCall"]'));
    return JSON.stringify(toolEls.slice(-8).map(el => el.innerText.substring(0, 150)));
})()
"""
print(run_js(js))
