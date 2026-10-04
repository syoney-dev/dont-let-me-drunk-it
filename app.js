const STORE_KEY = "dlmdi-v1";

// ---------- データ ----------
function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && s.records) return { records: s.records, settings: { gender: "m", name: "ゆうしゃ", preview: null, ...s.settings } };
  } catch (e) { /* 読めなければ初期状態 */ }
  return { records: {}, settings: { gender: "m", name: "ゆうしゃ", preview: null } };
}
function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* 保存できない環境 */ }
}

const state = loadState();

function dateKey(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function labelOf(key) {
  const [, m, d] = key.split("-").map(Number);
  return `${m}がつ${d}にち`;
}

// 今日が未記録なら昨日から数える
function streak() {
  let d = new Date();
  if (!state.records[dateKey(d)]) d = addDays(d, -1);
  let n = 0;
  while (state.records[dateKey(d)]?.status === "sober") { n++; d = addDays(d, -1); }
  return n;
}
function shownDays() { return state.settings.preview ?? streak(); }
function currentTier() { return tierIndex(shownDays()); }

// ---------- メッセージ（1文字ずつ表示） ----------
const msgEl = document.getElementById("msg");
let typeTimer = null;
function say(text) {
  clearInterval(typeTimer);
  let i = 0;
  msgEl.textContent = "";
  typeTimer = setInterval(() => {
    msgEl.textContent = text.slice(0, ++i);
    if (i >= text.length) clearInterval(typeTimer);
  }, 40);
}

// ---------- 入力フォーム ----------
let editingKey = dateKey(new Date());
let pickedStatus = null;
const noteEl = document.getElementById("note");
const cmdEls = [...document.querySelectorAll(".cmd")];

function loadForm(key) {
  editingKey = key;
  const r = state.records[key];
  pickedStatus = r?.status ?? null;
  noteEl.value = r?.note ?? "";
  const today = dateKey(new Date());
  document.getElementById("dateLabel").textContent =
    key === today ? "きょう の きろく" : `${labelOf(key)} の きろく`;
  renderForm();
}
function renderForm() {
  cmdEls.forEach((b) => b.setAttribute("aria-checked", String(b.dataset.status === pickedStatus)));
  document.getElementById("noteCount").textContent = `${noteEl.value.length}/100`;
}
cmdEls.forEach((b) => b.addEventListener("click", () => { pickedStatus = b.dataset.status; renderForm(); }));
noteEl.addEventListener("input", renderForm);

document.getElementById("save").addEventListener("click", () => {
  if (!pickedStatus) { say("のんだか どうか えらんでください。"); return; }
  const beforeTier = tierIndex(streak());
  state.records[editingKey] = { status: pickedStatus, note: noteEl.value.trim() };
  saveState();
  const days = streak();
  const name = state.settings.name;
  if (pickedStatus === "sober") {
    let t = `${name}は ゆうわくに うちかった！\nきんしゅ ${days}にちめ。`;
    if (tierIndex(days) > beforeTier && state.settings.preview == null) {
      const T = TIERS[tierIndex(days)];
      t += `\nレベルアップ！ ${T.weapon}と ${T.armor}を てにいれた！`;
    }
    say(t);
  } else {
    say(`${name}は ちからつきた…\nしかし ぼうけんは まだ おわらない。\nあした また たちあがろう。`);
  }
  loadForm(dateKey(new Date()));
  renderAll();
});

// ---------- 表示 ----------
function renderAll() {
  const days = shownDays();
  const t = currentTier();
  const T = TIERS[t];
  document.body.className = `tier-${t}`;
  document.getElementById("days").textContent = days;
  document.querySelector(".counter-num").classList.toggle("long", days >= 100);
  document.getElementById("rank").textContent = T.rank;
  document.getElementById("stName").textContent = state.settings.name;
  document.getElementById("stRank").textContent = T.rank;
  document.getElementById("stWeapon").textContent = T.weapon;
  document.getElementById("stArmor").textContent = T.armor;
  document.getElementById("stMonster").textContent = T.monster;
  const next = TIERS[t + 1];
  document.getElementById("stNext").textContent = next
    ? `つぎの そうびまで あと ${next.min - days}にち`
    : "さいきょうの そうびに たどりついた！";
  renderLog();
}

function renderLog() {
  const ul = document.getElementById("log");
  ul.textContent = "";
  const keys = Object.keys(state.records).sort().reverse().slice(0, 30);
  if (!keys.length) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "まだ なにも かかれていない。";
    ul.append(li);
    return;
  }
  for (const k of keys) {
    const r = state.records[k];
    const li = document.createElement("li");
    const d = document.createElement("span");
    d.textContent = k.slice(5).replace("-", "/");
    const s = document.createElement("span");
    s.textContent = r.status === "sober" ? "○" : "×";
    s.className = r.status === "sober" ? "ok" : "ng";
    const n = document.createElement("span");
    n.className = "note";
    n.textContent = r.note || "—";
    li.append(d, s, n);
    li.addEventListener("click", () => {
      loadForm(k);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    ul.append(li);
  }
}

// ---------- アニメーション（2fps） ----------
const battle = document.getElementById("battle").getContext("2d");
const portrait = document.getElementById("portrait").getContext("2d");
const battleMsg = document.getElementById("battleMsg");
const BW = 96, BH = 48, GROUND = 44;
let step = 0;

function battleScript(name, T, mx) {
  const m = T.monster;
  const near = mx - 22, mid = Math.round((6 + near) / 2);
  // [主人公x, ポーズ, 主人公点滅, モンスターずらし, モンスター点滅, モンスター表示, 斬撃, メッセージ]
  return [
    [6, "idle",   0, 0,   0, 1, 0, `${m}が あらわれた！`],
    [6, "idle",   0, 0,   0, 1, 0, `${m}が あらわれた！`],
    [mid, "walk",   0, 0,   0, 1, 0, `${name}の こうげき！`],
    [near, "attack", 0, 0,   1, 1, 1, `${name}の こうげき！`],
    [mid, "idle",   0, 2,   0, 1, 0, `${m}に ダメージを あたえた！`],
    [6, "idle",   0, -10, 0, 1, 0, `${m}は ${T.lure}`],
    [6, "idle",   1, 0,   0, 1, 0, `しかし ${name}は きっぱり ことわった！`],
    [near, "attack", 0, 0,   1, 1, 1, `${name}の かいしんの いちげき！`],
    [near, "idle",   0, 0,   0, 0, 0, `${m}を たおした！`],
    [6, "idle",   0, 0,   0, 0, 0, `${m}を たおした！`],
  ];
}

function tick() {
  const t = currentTier();
  const T = TIERS[t];
  const g = state.settings.gender;
  const f = step % 2;
  const M = MONSTERS[t];
  const baseX = BW - 4 - M.w;
  const [hx, pose, hFlash, mShift, mFlash, mShow, slash, text] = battleScript(state.settings.name, T, baseX)[step];
  const mx = baseX + mShift;

  drawBackground(battle, BW, BH, t, GROUND, f);
  if (mShow) drawMonster(battle, mx, GROUND, t, f, mFlash);
  else if (step === 8) { // きえる直前の けむり
    battle.fillStyle = "#ffffff";
    for (let i = 0; i < 6; i++) battle.fillRect(mx + (i * 7) % M.w, GROUND - 4 - (i * 5) % M.h, 2, 2);
  }
  drawHero(battle, hx, GROUND - 22, { tier: t, gender: g, pose, flash: hFlash });
  if (slash) {
    battle.fillStyle = "#ffffff";
    for (let i = 0; i < 12; i++) battle.fillRect(mx + 2 + i, GROUND - M.h - M.fly + i * 1.5, 2, 2);
  }
  if (battleMsg.textContent !== text) battleMsg.textContent = text;

  // ワイプ（上半身アップ）
  portrait.setTransform(1, 0, 0, 1, 0, 0);
  portrait.fillStyle = ["#202020", "#183050", "#4070c0", "#202838", "#300808", "#2a1060"][t];
  portrait.fillRect(0, 0, 32, 32);
  portrait.setTransform(2, 0, 0, 2, 0, 0);
  drawHero(portrait, 0, 4, { tier: t, gender: g, pose: "idle", blink: step === 4 });
  portrait.setTransform(1, 0, 0, 1, 0, 0);

  step = (step + 1) % 10;
}

// ---------- せってい ----------
const dlg = document.getElementById("settings");
document.getElementById("openSettings").addEventListener("click", () => {
  document.getElementById("setName").value = state.settings.name;
  document.querySelectorAll('input[name="gender"]').forEach((r) => { r.checked = r.value === state.settings.gender; });
  document.getElementById("setPreview").value = state.settings.preview ?? "";
  dlg.showModal();
});
document.getElementById("setName").addEventListener("input", (e) => {
  state.settings.name = e.target.value.trim() || "ゆうしゃ";
  saveState(); renderAll();
});
document.querySelectorAll('input[name="gender"]').forEach((r) =>
  r.addEventListener("change", () => { state.settings.gender = r.value; saveState(); }));
document.getElementById("setPreview").addEventListener("change", (e) => {
  state.settings.preview = e.target.value === "" ? null : Number(e.target.value);
  saveState(); renderAll();
});
document.getElementById("closeSettings").addEventListener("click", () => dlg.close());
document.getElementById("reset").addEventListener("click", () => {
  if (!confirm("ぼうけんの しょを すべて けしますか？")) return;
  state.records = {};
  saveState(); loadForm(dateKey(new Date())); renderAll();
  dlg.close();
  say("ぼうけんの しょは きえてしまった。");
});

// ---------- はじまり ----------
loadForm(dateKey(new Date()));
renderAll();
say(state.records[dateKey(new Date())]
  ? `${state.settings.name}よ、きょうも よく がんばった。`
  : `${state.settings.name}よ、きょうは のまずに すごせたか？`);
tick();
setInterval(tick, 500);

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
