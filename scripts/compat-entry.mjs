// Recover pages cached before the service-worker update without changing their URL.
import fs from 'node:fs';
import path from 'node:path';
const html = fs.readFileSync('dist/index.html', 'utf8');
const entry = html.match(/<script\b[^>]*type="module"[^>]*src="\/assets\/([^"/]+\.js)"/);
if (!entry) throw new Error('Could not locate the built app entrypoint');
const current = entry[1];
for (const legacy of ['index-DkweG_Fq.js', 'index-CSUDe5kk.js']) {
    if (legacy === current) continue;
    const content = `// Compatibility entry for a previously cached page.\nif ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js', {scope:'/',updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});\nimport('./${current}');\n`;
    fs.writeFileSync(path.join('dist/assets', legacy), content);
}
console.log('[Compatibility] Added recovery entries for cached pages');
