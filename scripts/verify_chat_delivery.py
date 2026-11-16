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
    // Look for all document / attachment elements in the chat history
    const docNodes = Array.from(document.querySelectorAll('#main [data-testid="document-thumb"], #main [data-testid="msg-document"], #main span[title*=".pdf"], #main span[title*=".zip"], #main div[role="row"]'));
    
    // Get the last 8 rows in the chat
    const rows = Array.from(document.querySelectorAll('#main div[role="row"]'));
    const lastRows = rows.slice(-8).map(r => ({
        text: r.innerText.replace(/\\n+/g, ' | ').substring(0, 150)
    }));

    return JSON.stringify({
        lastRowsCount: lastRows.length,
        lastRows
    });
})()
"""
print(run_js(js))
