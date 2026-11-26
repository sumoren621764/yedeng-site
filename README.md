# 夜燈命書・商品頁與法律頁

靜態網站，部署在 Vercel 專案 `yedeng`（https://yedeng.tw）。合併到 main 後，GitHub Actions「部署到 Vercel」會自動部署（`.github/workflows/deploy.yml`，用 Vercel 權杖 `VERCEL_TOKEN`，2027/11/20 到期）。

開 PR 時會先跑「檢查」（`.github/check.mjs`：JavaScript 語法、站內連結與圖片是否存在），紅叉就先別合併。本機也可以跑 `node .github/check.mjs`。

- index.html：命書與價格（商品頁），樣式在 legal.css、shop.css、stage.css
- faq.html、terms.html、privacy.html、refund.html
- img/：引路人插圖（webp）
- vercel.json：/products.html 導到首頁

只在這個 repo 改網站，避免多個工作區互相覆蓋。

## 出事時退回上一版

1. Vercel → 專案 `yedeng` → Deployments，找到出事前、狀態 Ready 的那一筆正式版本（Production）
2. 右邊「⋯」→ **Instant Rollback**（或 Promote to Production），yedeng.tw 會在幾秒內換回那一版
3. 退版之後，Vercel 會暫停把新部署自動設為正式版本；修好的程式合併後，到 Deployments 對最新那筆按 **Promote to Production**（或請 Claude 處理）
4. 修好之前不要合併別的 PR
