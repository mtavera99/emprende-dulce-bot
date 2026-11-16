import subprocess
import json

js = '''
(() => {
    try {
        const blocks = Array.from(document.querySelectorAll("div._assistant_47uec_66, [data-message-author-role='assistant'], div.prose"));
        const stopBtn = document.querySelector('button[aria-label*="Stop"], button[title*="Stop"]');
        
        return JSON.stringify({
            isGenerating: !!stopBtn,
            count: blocks.length,
            snippets: blocks.map(b => b.innerText)
        });
    } catch(e) {
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
data = json.loads(res.stdout) if res.stdout.strip() else {}
print("isGenerating:", data.get("isGenerating"))
for i, s in enumerate(data.get("snippets", [])):
    print(f"\n--- SNIPPET {i+1} ---\n")
    print(s)
