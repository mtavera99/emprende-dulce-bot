import subprocess
import json

js = '''
(() => {
    try {
        const assistants = Array.from(document.querySelectorAll("div._assistant_47uec_66"));
        const stopBtn = document.querySelector('button[aria-label*="Stop"], button[title*="Stop"]');
        
        const fullText = assistants.map(a => a.innerText).join("\\n---BLOCK---\\n");
        
        return JSON.stringify({
            isGenerating: !!stopBtn,
            length: fullText.length,
            fullText: fullText
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
data = json.loads(res.stdout) if res.stdout.strip() else {}
print("isGenerating:", data.get("isGenerating"))
print("Total length:", data.get("length"))
print("\n--- CONTENT PREVIEW ---\n")
print(data.get("fullText", "")[:2000])
print("\n--- END PREVIEW ---\n")
print(data.get("fullText", "")[-2000:])
