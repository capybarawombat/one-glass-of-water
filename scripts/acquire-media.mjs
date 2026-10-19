/** Run explicitly with network access. Original media and license metadata are saved together. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root = new URL('../', import.meta.url).pathname;
const directory = path.join(root, 'public/media');
const manifest = JSON.parse(await fs.readFile(path.join(directory, 'manifest.json'), 'utf8'));
const select = process.argv.find(a => a.startsWith('--only='))?.split('=')[1];
const userAgent = 'OneGlassOfWater/3.0 (educational water-awareness campaign; capybarawombat/one-glass-of-water)';
async function fetchOK(url) {
  const response = await fetch(url, { headers: { 'User-Agent': userAgent }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response;
}
const recordsPath = path.join(directory, 'acquisition.json');
let records = {};
try { records = JSON.parse(await fs.readFile(recordsPath, 'utf8')); } catch {}
for (const asset of manifest.filter(asset => !select || asset.id === select)) {
  try {
    const query = new URLSearchParams({ action: 'query', titles: `File:${asset.commons}`, prop: 'imageinfo', iiprop: 'url|extmetadata', format: 'json' });
    const metadata = await (await fetchOK(`https://commons.wikimedia.org/w/api.php?${query}`)).json();
    const info = Object.values(metadata.query.pages)[0].imageinfo?.[0];
    if (!info?.url) throw new Error('No original file returned by Commons');
    const license = info.extmetadata?.LicenseShortName?.value ?? '';
    const licenseURL = info.extmetadata?.LicenseUrl?.value ?? '';
    const pd = /public domain|PD-|CC0/i.test(license);
    const expected = asset.license.startsWith('Public domain') ? pd : licenseURL.replace(/^http:/,'https:').replace(/\/$/,'') === asset.licenseUrl.replace(/\/$/,'');
    if (!expected) throw new Error(`License differs from reviewed selection: ${license} ${licenseURL}. Review manually; no file downloaded.`);
    const original = path.join(directory, `.original-${asset.id}${asset.filename.endsWith('.mp4') ? '.webm' : '.jpg'}`);
    const bytes = Buffer.from(await (await fetchOK(info.url)).arrayBuffer());
    await fs.writeFile(original, bytes);
    const output = path.join(directory, asset.filename);
    if (asset.filename.endsWith('.mp4')) {
      execFileSync('ffmpeg', ['-y','-ss','8','-i',original,'-t','12','-vf','scale=960:-2','-an','-c:v','libx264','-preset','medium','-crf','28','-pix_fmt','yuv420p','-movflags','+faststart',output], { stdio: 'pipe' });
    } else {
      execFileSync('python3', ['-c', 'from PIL import Image,ImageOps;import sys;im=ImageOps.exif_transpose(Image.open(sys.argv[1])).convert("RGB");im.thumbnail((1600,1600));im.save(sys.argv[2],"WEBP",quality=84,method=6)', original, output]);
    }
    const optimized = await fs.readFile(output);
    records[asset.id] = { acquired: new Date().toISOString(), originalURL: info.url, originalSha256: crypto.createHash('sha256').update(bytes).digest('hex'),
      sha256: crypto.createHash('sha256').update(optimized).digest('hex'), bytes: optimized.length,
      originalMetadata: info.extmetadata, modifications: asset.changes };
    await fs.writeFile(recordsPath, JSON.stringify(records, null, 2) + '\n');
    await fs.unlink(original);
    console.log(`Acquired ${asset.id}: ${optimized.length} bytes · ${license}`);
  } catch (error) {
    console.error(`Media acquisition stopped at ${asset.id}: ${error.message}`);
    process.exitCode = 1; break;
  }
}
