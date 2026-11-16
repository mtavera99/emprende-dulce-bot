import subprocess
import json

js = '''
(() => {
    try {
        const assistants = Array.from(document.querySelectorAll("div._assistant_47uec_66"));
        const stopBtn = document.querySelector('button[aria-label*="Stop"], button[title*="Stop"]');
        
        let toolText = [];
        document.querySelectorAll('div').forEach(d => {
            if (d.className && typeof d.className === 'string' && d.className.includes('tool')) {
                toolText.push(d.innerText.trim());
            }
        });
        
        return JSON.stringify({
            isGenerating: !!stopBtn,
            assistantCount: assistants.length,
            lastAssistantSnippet: assistants.length ? assistants[assistants.length - 1].innerText.slice(-1000) : "",
            toolCount: toolText.length,
            recentTools: toolText.slice(-6)
        });
    } catch (e) {
        return JSON.stringify({ error: e.toString() });
    }
})()
'''

as_script = f'''
tell application "Google Chrome"
    tell tab 5 of window 1
        return execute javascript {json.dumps(js)}
    end tell
end tell
'''

res = subprocess.run(["osascript", "-e", as_script], capture_output=True, text=True)
print(res.stdout)
if res.stderr:
    print("STDERR:", res.stderr)
