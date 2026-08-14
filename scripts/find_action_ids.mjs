import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const chunkRoot = fileURLToPath(new URL("../.next/static/chunks/", import.meta.url));
const out = [];
const re = /createServerReference\)\("([0-9a-f]{40})"[^)]*,\s*"([^"]+)"\)/g;
function scanFile(t, label) {
  let m;
  while ((m = re.exec(t))) out.push(m[2] + " = " + m[1] + "  [" + label + "]");
}
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name.endsWith(".js")) {
      try { scanFile(fs.readFileSync(full, "utf8"), full.slice(chunkRoot.length).replace(/\\/g, "/")); }
      catch {}
    }
  }
}
walk(chunkRoot);
const sorted = [...new Map(out.map((l) => [l.split(" = ")[0], l])).values()].sort();
fs.writeFileSync(new URL("../ids_out.txt", import.meta.url), sorted.join("\n"));






