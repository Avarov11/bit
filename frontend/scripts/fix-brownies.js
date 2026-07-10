// fix-brownies.js
// Trims transparent/white padding from all brownie PNGs and re-uploads
// with consistent 600x600 canvas so all colors appear the same size.
// Originals are backed up to frontend/brownie-backup/ before any changes.

const sharp = require("sharp");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load .env.local
const envFile = path.join(__dirname, "../.env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim().replace(/^"|"$/g, "");
    if (key && !process.env[key]) process.env[key] = val;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const BACKUP = path.join(__dirname, "../brownie-backup");
fs.mkdirSync(BACKUP, { recursive: true });

const BUCKETS = {
  "shapes": [
    "brown1.png","brown2.png",
    "beige1.png","beige2.png",
    "black1.png","black2.png",
    "red1.png","red2.png",
    "blue1.png","blue2.png",
    "white1.png","white2.png",
  ],
  "shapes heart": [
    "1 bb.png","1be.png","1bl.png","1br.png","1pi.png","1wh.png",
    "2bb.png","2be.png","2bl.png","2br.png","2pi.png","2wh.png",
    "3bb.png","3be.png","3bl.png","3br.png","3pi.png","3wh.png",
  ],
  "shape square": [
    "1bb.png","1be.png","1bl.png","1br.png","1pi.png","1wh.png",
    "2bb.png","2be.png","2bl.png","2br.png","2pi.png","2wh.png",
    "3bb.png","3be.png","3bl.png","3br.png","3pi.png","3wh.png",
  ],
};

async function normalizeImage(buffer) {
  return sharp(buffer)
    .trim()
    .resize(520, 520, {
      fit: "inside",
      withoutEnlargement: false,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extend({
      top: 40, bottom: 40, left: 40, right: 40,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function main() {
  let ok = 0, fail = 0;

  for (const [bucket, files] of Object.entries(BUCKETS)) {
    console.log(`\n📦 ${bucket}`);
    for (const file of files) {
      try {
        // Download
        const { data, error: dlErr } = await supabase.storage.from(bucket).download(file);
        if (dlErr) throw new Error(dlErr.message);
        const original = Buffer.from(await data.arrayBuffer());

        // Backup
        const backupName = bucket.replace(/\s/g, "_") + "__" + file;
        fs.writeFileSync(path.join(BACKUP, backupName), original);

        // Process
        const processed = await normalizeImage(original);

        // Re-upload
        const { error: upErr } = await supabase.storage
          .from(bucket)
          .upload(file, processed, { contentType: "image/png", upsert: true });
        if (upErr) throw new Error(upErr.message);

        console.log(`  ✓ ${file}`);
        ok++;
      } catch (e) {
        console.error(`  ✗ ${file} — ${e.message}`);
        fail++;
      }
    }
  }

  console.log(`\n✅ Done — ${ok} updated, ${fail} failed`);
  console.log(`📁 Backups saved to: ${BACKUP}`);
}

main().catch(console.error);
