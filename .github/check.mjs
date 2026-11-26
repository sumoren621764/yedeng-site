// 網站上線前的基本檢查：JavaScript 語法、站內連結與圖片是否存在
import { readFileSync, existsSync, readdirSync } from "node:fs";
import vm from "node:vm";

const errors = [];
const pages = readdirSync(".").filter(f => f.endsWith(".html"));

function syntax(code, where) {
  try { new vm.Script(code, { filename: where }); }
  catch (e) { errors.push(`${where}：JavaScript 語法錯誤 ${e.message}`); }
}

for (const f of readdirSync(".").filter(f => f.endsWith(".js"))) syntax(readFileSync(f, "utf8"), f);

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  let i = 0;
  for (const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    i++;
    const attrs = m[1];
    if (/\bsrc=/.test(attrs) || /type="(application\/(ld\+)?json|text\/template)"/.test(attrs)) continue;
    if (/type="module"/.test(attrs)) continue;          // module 另外由瀏覽器檢查
    syntax(m[2], `${page} 第 ${i} 段 <script>`);
  }
  for (const m of html.matchAll(/\b(?:href|src)="([^"#?]+)(?:[#?][^"]*)?"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|data:|\/\/|javascript:)/.test(url)) continue;
    const path = url.replace(/^\//, "") || "index.html";
    if (!existsSync(path) && !existsSync(path + ".html") && !existsSync(path + "/index.html"))
      errors.push(`${page}：連到不存在的檔案 ${url}`);
  }
}

if (errors.length) { console.log(errors.join("\n")); process.exit(1); }
console.log(`檢查通過：${pages.length} 個頁面`);
