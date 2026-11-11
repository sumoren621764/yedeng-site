/* 夜燈命書：前端共用工具（會員、結帳、訂單狀態、閱讀連結）
 * 所有資料都透過 api.yedeng.tw，前端不直接碰資料庫。
 * Supabase 只用來做 Email 驗證碼與 Google 登入；登入後換成後端的 HttpOnly session cookie。
 */
(function () {
  "use strict";
  var CFG = {
    api: "https://api.yedeng.tw",
    supabaseUrl: "https://vmbpodrggpkeybkpvnmr.supabase.co",
    supabaseKey: "sb_publishable__jgCagxzaYG4otrl8Yzkmg_M_k7CGKy" // 公開金鑰：資料表全鎖，只能用來登入
  };
  try { var o = localStorage.getItem("yd_api"); if (o && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)) CFG.api = o; } catch (e) {}

  function api(path, opts) {
    opts = opts || {};
    var init = { method: opts.method || "GET", credentials: "include", headers: {} };
    if (opts.body !== undefined) { init.headers["Content-Type"] = "application/json"; init.body = JSON.stringify(opts.body); }
    return fetch(CFG.api + path, init).then(function (r) {
      return r.text().then(function (t) {
        var d = null; try { d = t ? JSON.parse(t) : null; } catch (e) {}
        if (!r.ok) {
          var msg = d && d.detail;
          if (Array.isArray(msg)) msg = "資料格式有誤，請檢查後再送出";
          var err = new Error(msg || "連線失敗，請稍後再試"); err.status = r.status; throw err;
        }
        return d;
      });
    }, function () { throw new Error("連不上伺服器，請確認網路後再試"); });
  }

  var _sb = null;
  function sb() {
    if (_sb) return Promise.resolve(_sb);
    return new Promise(function (ok, no) {
      if (window.supabase) { _sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, { auth: { persistSession: true, detectSessionInUrl: true, flowType: "pkce" } }); return ok(_sb); }
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";
      s.crossOrigin = "anonymous";
      s.onload = function () { _sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, { auth: { persistSession: true, detectSessionInUrl: true, flowType: "pkce" } }); ok(_sb); };
      s.onerror = function () { no(new Error("登入元件載入失敗，請重新整理")); };
      document.head.appendChild(s);
    });
  }

  /* 把 Supabase 的登入換成本站 session；之後就不需要 Supabase 的 session */
  function exchange(path) {
    return sb().then(function (c) {
      return c.auth.getSession().then(function (r) {
        var s = r.data && r.data.session;
        if (!s) return false;
        return api(path || "/auth/session", { method: "POST", body: { access_token: s.access_token } })
          .then(function () { return c.auth.signOut({ scope: "local" }).catch(function () {}); })
          .then(function () { return true; });
      });
    });
  }

  function safeNext(n) { return n && /^\/(?!\/)[\w\-./?=&#%]*$/.test(n) ? n : "/account.html"; }

  /* 結帳：建立訂單 → 存下查詢代碼 → 自動送出綠界表單 */
  function checkout(payload) {
    return api("/orders", { method: "POST", body: payload }).then(function (d) {
      try { localStorage.setItem("yd_order_" + d.trade_no, d.order_token); } catch (e) {}
      var f = document.createElement("form");
      f.method = "POST"; f.action = d.action; f.style.display = "none";
      Object.keys(d.fields).forEach(function (k) {
        var i = document.createElement("input"); i.type = "hidden"; i.name = k; i.value = d.fields[k]; f.appendChild(i);
      });
      document.body.appendChild(f); f.submit();
      return d;
    });
  }

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fmtDate(s) { if (!s) return ""; var d = new Date(s); return d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate(); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function toast(msg, bad) {
    var t = document.createElement("div"); t.className = "toast" + (bad ? " bad" : ""); t.setAttribute("role", "status"); t.textContent = msg;
    document.body.appendChild(t); requestAnimationFrame(function () { t.classList.add("on"); });
    setTimeout(function () { t.classList.remove("on"); setTimeout(function () { t.remove(); }, 400); }, 3200);
  }
  function busy(btn, on, text) {
    if (!btn) return;
    if (on) { btn.dataset.label = btn.textContent; btn.textContent = text || "處理中…"; btn.disabled = true; }
    else { btn.textContent = btn.dataset.label || btn.textContent; btn.disabled = false; }
  }

  window.YD = { cfg: CFG, api: api, sb: sb, exchange: exchange, checkout: checkout, safeNext: safeNext, esc: esc, fmtDate: fmtDate, $: $, toast: toast, busy: busy };
})();
