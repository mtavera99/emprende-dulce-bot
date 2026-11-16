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
    // Look for tool calls or active thought elements in Kiro
    const thought = document.querySelector('[class*="thought"], [data-testid*="thought"]');
    const tools = Array.from(document.querySelectorAll('[class*="tool"], [data-testid*="tool"]')).map(t => t.innerText.substring(0, 100));
    const activeText = document.querySelector('.mantine-TypographyStylesProvider-root') || document.body;
    
    return JSON.stringify({
        thoughtText: thought ? thought.innerText.substring(0, 200) : null,
        toolCount: tools.length,
        tools: tools.slice(-5)
    });
})()
"""
print(run_js(js))
