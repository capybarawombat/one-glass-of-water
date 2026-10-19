import fs from 'node:fs';
import crypto from 'node:crypto';
const directory = new URL('../public/media/', import.meta.url);
const manifest = JSON.parse(fs.readFileSync(new URL('manifest.json', directory), 'utf8'));
let acquisition = {};
try { acquisition = JSON.parse(fs.readFileSync(new URL('acquisition.json', directory), 'utf8')); } catch {}
const failures = [];
for (const asset of manifest) {
  const file = new URL(asset.filename, directory);
  if (!fs.existsSync(file)) { if (asset.required) failures.push(`${asset.id}: missing ${asset.filename}`); continue; }
  const bytes = fs.readFileSync(file), record = acquisition[asset.id];
  if (!record || record.sha256 !== crypto.createHash('sha256').update(bytes).digest('hex')) failures.push(`${asset.id}: missing or mismatched acquisition record`);
  if (bytes.length < 1000 || bytes.length > (asset.filename.endsWith('.mp4') ? 4_000_000 : 900_000)) failures.push(`${asset.id}: asset exceeds approved size budget or is invalid`);
  if (!asset.creator || !asset.licenseUrl || !asset.source || !asset.changes) failures.push(`${asset.id}: incomplete attribution`);
}
if (failures.length) { console.error('Documentary media is not ready for publication:\n' + failures.map(f => `- ${f}`).join('\n')); process.exitCode = 1; }
else console.log('All required documentary media and acquisition hashes verified.');
