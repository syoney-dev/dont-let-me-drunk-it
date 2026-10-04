// ドット絵の描画（すべて canvas に矩形を並べて描く）

const TIERS = [
  { min: 0,   rank: "みならい", weapon: "ひのきのぼう",   armor: "ぬののふく",
    armorC: "#a89070", armorHi: "#c8b090", sleeve: "#a89070", pants: "#605040", boots: "#403020", belt: "#504030",
    blade: "#8b5a2b", hilt: "#8b5a2b", len: 0, monster: "のろいのジョッキ",
    lure: "「かんぱい しようぜ…」と せまってきた！" },
  { min: 3,   rank: "たびびと", weapon: "どうのつるぎ",   armor: "かわのよろい",
    armorC: "#8b5a2b", armorHi: "#b07840", sleeve: "#704020", pants: "#504038", boots: "#302018", belt: "#c09030",
    blade: "#d08840", hilt: "#704020", len: 7, monster: "チューハイバット",
    lure: "「いっぱい だけ」と ささやいた！" },
  { min: 7,   rank: "せんし",   weapon: "てつのつるぎ",   armor: "くさりかたびら",
    armorC: "#8890a0", armorHi: "#b0b8c8", sleeve: "#686e80", pants: "#384060", boots: "#282830", belt: "#704020",
    blade: "#c8c8d0", hilt: "#704020", len: 8, shield: "#704020", shieldHi: "#a0a0b0", monster: "ワインゴースト",
    lure: "あかワインの かおりを はなった！" },
  { min: 14,  rank: "きし",     weapon: "はがねのつるぎ", armor: "はがねのよろい",
    armorC: "#c0c8d8", armorHi: "#ffffff", sleeve: "#3050c0", pants: "#3050c0", boots: "#606878", belt: "#f8d830",
    blade: "#e8f0ff", hilt: "#f8d830", len: 9, shield: "#3050c0", shieldHi: "#f8d830", helm: "#c0c8d8",
    monster: "サケゴーレム", lure: "あつかんを ついできた！" },
  { min: 30,  rank: "えいゆう", weapon: "ミスリルソード", armor: "ミスリルメイル",
    armorC: "#60c8f0", armorHi: "#d0f8ff", sleeve: "#2060a0", pants: "#204080", boots: "#f8d830", belt: "#f8d830",
    blade: "#a0f0ff", hilt: "#f8d830", len: 10, shield: "#2060a0", shieldHi: "#f8d830", helm: "#60c8f0",
    plume: "#e03030", cape: "#c02020", monster: "ウイスキードラゴン",
    lure: "こはくいろの ほのおを はいた！" },
  { min: 100, rank: "ゆうしゃ", weapon: "ひかりのつるぎ", armor: "ひかりのよろい",
    armorC: "#f8d830", armorHi: "#fff8c0", sleeve: "#f8f8f8", pants: "#f8f8f8", boots: "#f8d830", belt: "#e03030",
    blade: "#ffffff", hilt: "#f8d830", len: 11, shield: "#f8d830", shieldHi: "#e03030", crown: true,
    cape: "#6020c0", glow: "#fff8a0", monster: "だいまおう アルコール",
    lure: "せかいじゅうの さけを よびよせた！" },
];

function tierIndex(days) {
  let t = 0;
  for (let i = 0; i < TIERS.length; i++) if (days >= TIERS[i].min) t = i;
  return t;
}

function painter(ctx, ox, oy, flash) {
  return (x, y, w, h, c) => {
    ctx.fillStyle = flash ? "#ffffff" : c;
    ctx.fillRect(ox + x, oy + y, w, h);
  };
}

// 主人公（右向き・16x24 程度）
// o: { tier, gender, pose: "idle"|"walk"|"attack", flash, blink }
function drawHero(ctx, ox, oy, o) {
  const T = TIERS[o.tier];
  const P = painter(ctx, ox, oy, o.flash);
  const skin = "#f8b888";
  const hair = o.gender === "f" ? "#e06020" : "#583010";

  if (T.cape) { P(3, 8, 3, 11, T.cape); P(2, 13, 2, 7, T.cape); }
  if (o.gender === "f") P(4, 3, 2, 8, hair);

  // 足
  if (o.pose === "walk") {
    P(4, 15, 2, 5, T.pants); P(9, 15, 2, 5, T.pants);
    P(3, 20, 3, 2, T.boots); P(9, 20, 3, 2, T.boots);
  } else {
    P(5, 15, 2, 5, T.pants); P(8, 15, 2, 5, T.pants);
    P(5, 20, 3, 2, T.boots); P(8, 20, 3, 2, T.boots);
  }
  if (o.gender === "f") P(4, 14, 8, 3, T.armorC);

  // 胴
  P(5, 8, 6, 7, T.armorC);
  P(6, 9, 1, 3, T.armorHi);
  P(5, 13, 6, 1, T.belt);

  if (T.shield) { P(2, 9, 4, 6, T.shield); P(3, 10, 2, 4, T.shieldHi); }

  // 頭
  P(5, 2, 6, 6, skin);
  if (o.blink) P(9, 5, 1, 1, "#000"); else P(9, 4, 1, 2, "#000");
  P(5, 1, 6, 2, hair);
  if (o.gender === "f") P(4, 2, 3, 5, hair); else P(5, 3, 2, 3, hair);

  if (T.helm) {
    P(4, 0, 8, 3, T.helm); P(4, 3, 2, 3, T.helm); P(5, 0, 6, 1, T.armorHi);
    if (T.plume) { P(6, -2, 3, 2, T.plume); P(5, -1, 1, 1, T.plume); }
  }
  if (T.crown) {
    const g = "#f8d830";
    P(5, -1, 6, 2, g); P(5, -3, 1, 2, g); P(7, -3, 2, 2, g); P(10, -3, 1, 2, g);
    P(7, -1, 2, 1, "#e03030");
  }

  // 腕と武器
  if (o.pose === "attack") {
    P(10, 9, 4, 2, T.sleeve); P(14, 9, 2, 2, skin);
    if (T.len === 0) { P(16, 8, 7, 3, T.blade); P(22, 7, 2, 5, T.blade); }
    else {
      P(15, 7, 1, 6, T.hilt);
      P(16, 9, T.len, 2, T.blade);
      if (T.glow) P(16, 8, T.len, 1, T.glow);
    }
  } else {
    P(10, 9, 2, 4, T.sleeve); P(11, 12, 2, 2, skin);
    if (T.len === 0) { P(12, 4, 3, 8, T.blade); P(12, 3, 3, 1, "#a07040"); }
    else {
      P(10, 12, 5, 1, T.hilt);
      P(12, 12 - T.len, 2, T.len, T.blade);
      if (T.glow) P(11, 12 - T.len, 1, T.len, T.glow);
    }
  }
}

// ---------- モンスター（左向き） ----------
// 戻り値は {w,h}。(x,y) は左上
const MONSTERS = [
  { w: 16, h: 16, fly: 0, draw(P, f) {           // のろいのジョッキ
    const g = "#d89000", d = "#a05800", k = "#300800", foam = "#f0f0e0";
    P(1, 3, 12, 13, g); P(1, 3, 1, 13, d); P(12, 3, 1, 13, d); P(1, 15, 12, 1, d);
    P(13, 5, 3, 1, d); P(15, 5, 1, 7, d); P(13, 11, 3, 1, d);       // とって
    P(0, 0, 14, 3, foam); P(1, -1, 5, 1, foam); P(8, -1, 4, 1, foam);
    P(2, 3, 1, f ? 4 : 2, foam); P(6, 3, 1, f ? 2 : 4, foam); P(10, 3, 1, 3, foam); // たれる あわ
    P(2, 5, 4, 1, k); P(8, 5, 4, 1, k);                               // つりあがった まゆ
    P(3, 6, 3, 2, "#ff2020"); P(8, 6, 3, 2, "#ff2020");
    P(4, 6, 1, 1, k); P(9, 6, 1, 1, k);
    P(3, 9, 8, f ? 5 : 4, k);                                         // くち
    P(3, 9, 1, 2, "#fff"); P(5, 9, 1, 1, "#fff"); P(7, 9, 1, 1, "#fff"); P(9, 9, 2, 2, "#fff");
    P(4, f ? 13 : 12, 1, 1, "#fff"); P(8, f ? 13 : 12, 1, 1, "#fff");
    P(11, 12, 1, 1, "#f8e080"); P(2, 14, 1, 1, "#f8e080");
  } },
  { w: 22, h: 12, fly: 18, draw(P, f) {          // チューハイバット
    const c = "#9040c0";
    P(8, 3, 7, 6, c); P(9, 1, 2, 2, c); P(13, 1, 2, 2, c);
    P(9, 5, 2, 1, "#ff3030"); P(13, 5, 2, 1, "#ff3030");
    P(10, 8, 1, 2, "#fff"); P(13, 8, 1, 2, "#fff");
    if (f) { P(1, 0, 7, 2, c); P(3, 2, 5, 2, c); P(15, 0, 7, 2, c); P(15, 2, 5, 2, c); }
    else   { P(1, 7, 7, 2, c); P(3, 5, 5, 2, c); P(15, 7, 7, 2, c); P(15, 5, 5, 2, c); }
    P(0, 4, 3, 3, "#f8f040"); // レモン
  } },
  { w: 14, h: 22, fly: 4, draw(P, f) {            // ワインゴースト
    const g = "#285838";
    P(5, 0, 4, 1, "#a02030"); P(5, 1, 4, 4, g);
    P(3, 5, 8, 1, g); P(2, 6, 10, 12, g);
    P(3, 10, 8, 4, "#f0e0c0"); P(4, 11, 6, 1, "#a02030");
    P(3, 7, 2, 2, "#ff4040"); P(8, 7, 2, 2, "#ff4040");
    if (f) { P(2, 18, 3, 3, g); P(7, 18, 3, 2, g); P(11, 18, 1, 3, g); }
    else   { P(3, 18, 2, 2, g); P(6, 18, 3, 3, g); P(10, 18, 2, 2, g); }
    P(1, 15 + f, 1, 2, "#a02030");
  } },
  { w: 24, h: 30, fly: 0, draw(P, f) {           // サケゴーレム（とっくり）
    const w = "#e8e8f0", s = "#888898";
    P(9, 0, 6, 2, w); P(10, 2, 4, 4, w);
    P(6, 6, 12, 2, w); P(4, 8, 16, 16, w); P(6, 24, 12, 2, w);
    P(4, 12, 16, 3, "#3050c0");
    P(7, 9, 3, 2, "#000"); P(14, 9, 3, 2, "#000");
    P(8, 17, 8, 2, "#606070");
    const a = f ? -2 : 0;
    P(0, 10 + a, 4, 10, s); P(20, 12, 4, 9, s);
    P(6, 26, 4, 4, s); P(14, 26, 4, 4, s);
  } },
  { w: 34, h: 28, fly: 0, draw(P, f) {           // ウイスキードラゴン
    const c = "#c07020", d = "#804010", y = "#f8d870";
    P(16, 2, 14, 6, d);  P(20, 0, 8, 2, d);       // つばさ
    P(14, 8, 16, 12, c); P(16, 20, 4, 6, c); P(25, 20, 4, 6, c);
    P(28, 14, 6, 3, c);  P(31, 11, 3, 3, c);      // しっぽ
    P(17, 12, 10, 6, y);                           // おなか
    P(8, 4, 8, 6, c);    P(10, 8, 6, 4, c);        // くび・あたま
    P(3, 6, 6, 4, c);
    P(6, 6, 2, 1, "#ff3030"); P(9, 2, 2, 2, "#f0f0f0");
    if (f) { P(0, 9, 3, 1, "#f8a000"); P(-6, 8, 6, 3, "#f8a000"); P(-9, 9, 3, 1, "#f8e040"); }
  } },
  { w: 34, h: 38, fly: 0, draw(P, f) {           // だいまおう アルコール
    const r = "#6020a0", k = "#301050";
    if (f) { P(-2, 6, 38, 1, "#c060ff"); P(-2, 30, 38, 1, "#c060ff"); }
    P(4, 12, 26, 26, k);                            // マント
    P(9, 10, 16, 26, r);
    P(11, 2, 12, 10, "#80d080");                    // かお
    P(9, 0, 2, 4, "#f0f0f0"); P(23, 0, 2, 4, "#f0f0f0"); // つの
    P(13, 5, 3, 2, "#ff2020"); P(19, 5, 3, 2, "#ff2020");
    P(14, 9, 6, 1, "#000");
    P(13, 20, 8, 2, "#f8d830");
    P(1, 16, 8, 3, r);                              // うで
    P(-3, 10, 6, 5, "#f8d830"); P(-2, 17, 4, 1, "#f8d830"); P(-1, 15, 2, 2, "#f8d830"); // さかずき
    P(-2, 11, 4, 2, "#c02040");
  } },
];

function drawMonster(ctx, x, ground, tier, frame, flash) {
  const M = MONSTERS[tier];
  const y = ground - M.h - M.fly + (M.fly && frame ? 2 : 0);
  M.draw(painter(ctx, x, y, flash), frame);
}

// ---------- バトル背景 ----------
function drawBackground(ctx, w, h, tier, ground, frame) {
  const fill = (x, y, ww, hh, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, ww, hh); };
  const bg = [
    ["#000000", "#303030"],
    ["#183050", "#286028"],
    ["#4070c0", "#309030"],
    ["#202838", "#585868"],
    ["#300808", "#602010"],
    ["#100020", "#281040"],
  ][tier];
  fill(0, 0, w, h, bg[0]);
  fill(0, ground, w, h - ground, bg[1]);
  if (tier === 0) return; // 無課金はまっくら
  if (tier === 1 || tier === 2) {
    for (let i = 0; i < w; i += 9) fill(i + (frame * 2) % 3, ground + 3 + (i % 4), 2, 1, "#58b048");
    if (tier === 2) { fill(16, 8, 14, 3, "#fff"); fill(20, 6, 8, 2, "#fff"); fill(64, 12, 12, 2, "#fff"); }
  }
  if (tier === 3) {
    for (let y = 0; y < ground; y += 6)
      for (let x = (y / 6) % 2 ? 0 : 6; x < w; x += 12) fill(x, y, 11, 5, "#2c3446");
    fill(42, 4, 12, 14, "#101420"); fill(46, 7, 4, 8, "#f8d830");
  }
  if (tier === 4) {
    for (let x = 0; x < w; x += 7) fill(x, ground + 1 + ((x + frame) % 3), 4, 1, frame ? "#f86000" : "#f8a000");
    fill(0, 0, w, 3, "#501010"); for (let x = 2; x < w; x += 11) fill(x, 3, 3, 4, "#501010");
  }
  if (tier === 5) {
    const stars = [[6, 5], [22, 12], [40, 3], [70, 9], [90, 14], [62, 2], [52, 18]];
    stars.forEach(([x, y], i) => fill(x, y, 1, 1, (i + frame) % 2 ? "#ffffff" : "#8060c0"));
    fill(80, 4, 8, 8, "#f0e8a0"); fill(82, 4, 6, 6, "#100020");
  }
}

// ---------- カレンダー用アイコン ----------
function drawCoin(ctx) {
  const P = painter(ctx, 0, 0, false);
  const o = "#a06800", g = "#f8d830";
  P(4, 1, 8, 1, o); P(2, 2, 12, 12, o); P(4, 14, 8, 1, o); P(3, 3, 10, 10, o);
  P(4, 2, 8, 12, g); P(3, 4, 10, 8, g);
  P(5, 4, 6, 8, "#e0b020"); P(6, 5, 4, 6, g);
  P(7, 6, 2, 4, o);
  P(4, 4, 1, 3, "#fff8b0"); P(5, 3, 2, 1, "#fff8b0");
}
function iconURL(draw) {
  const c = document.createElement("canvas");
  c.width = c.height = 16;
  draw(c.getContext("2d"));
  return c.toDataURL();
}
