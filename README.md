# 夜燈命書・商品頁與法律頁

靜態網站，部署在 Vercel 專案 `yedeng`（https://yedeng.tw）。push 到 main 會自動部署。

- index.html：命書與價格（商品頁），樣式在 legal.css、shop.css、stage.css
- faq.html、terms.html、privacy.html、refund.html
- img/：引路人插圖（webp）
- vercel.json：/products.html 導到首頁

只在這個 repo 改網站，避免多個工作區互相覆蓋。
