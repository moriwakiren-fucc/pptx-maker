let copyTimer = null;

/* ------------------------------
   コピー処理
------------------------------ */
function copyButton() {
  const promptBox = document.getElementById("prompt");
  const ikanoran = document.getElementById("ikanoran");
  const min = document.getElementById("min").value || "";
  const max = document.getElementById("max").value || "";
  const demand = document.getElementById("demand").value || "";
  const content = document.getElementById("promput").value || "";

  const baseText = promptBox.cloneNode(true);
  baseText.querySelectorAll("input, textarea").forEach(el => el.remove());

  const result = baseText.textContent
    .trim()
    .replace(
      "- スライドの枚数は枚以上枚以下とする",
      `- スライドの枚数は ${min} 枚以上 ${max} 枚以下とする`
    )
    .replace(ikanoran.textContent, demand)
    + "\n"
    + content;

  navigator.clipboard.writeText(result);

  const btn = document.getElementById("copybutton");
  btn.textContent = "コピー完了";

  if (copyTimer !== null) clearTimeout(copyTimer);

  copyTimer = setTimeout(() => {
    btn.textContent = "コピーする";
    copyTimer = null;
  }, 2000);
}

/* ------------------------------
   実行 & エラーハンドリング
------------------------------ */
const runBtn = document.getElementById("runBtn");
const codeInput = document.getElementById("codeInput");
const errorBox = document.getElementById("errorBox");

runBtn.addEventListener("click", () => {
  errorBox.textContent = "";

  try {
    const wrapper = new Function(
      "PptxGenJS",
      `"use strict";\n${codeInput.value}`
    );
    wrapper(PptxGenJS);
  } catch (err) {
    errorBox.textContent = formatError(err, codeInput.value);
  }
});

/* ------------------------------
   エラー整形
------------------------------ */
function formatError(err, code) {
  let msg = "エラーが発生しました\n\n";
  msg += `種類: ${err.name}\n`;
  msg += `内容: ${err.message}\n`;

  if (err.stack) {
    const m = err.stack.match(/<anonymous>:(\d+):(\d+)/);
    if (m) {
      const line = Number(m[1]) - 1;
      const col = m[2];
      const codeLine = code.split("\n")[line - 1] || "";
      msg += `行: ${line}\n列: ${col}\n\n該当行:\n${codeLine}`;
    }
  }
  return msg;
}

/* ------------------------------
   フォーカス解除
------------------------------ */
document.addEventListener("pointerdown", e => {
  const a = document.activeElement;
  if (
    a &&
    (a.tagName === "INPUT" || a.tagName === "TEXTAREA") &&
    !a.contains(e.target)
  ) a.blur();
}, true);

/* ===============================
   pptx 保存専用ストレージ
=============================== */
const PptxStore = {
  prefix: "pptx_",

  save(key, data) {
    localStorage.setItem(this.prefix + key, JSON.stringify(data));
  },

  loadAll() {
    return Object.keys(localStorage)
      .filter(k => k.startsWith(this.prefix))
      .map(k => {
        try {
          return { key: k, data: JSON.parse(localStorage.getItem(k)) };
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  clearAll() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this.prefix))
      .forEach(k => localStorage.removeItem(k));
  }
};

/* ===============================
   保存・復元
=============================== */
function nowString() {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")} ` +
         `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

const slideTitleInput = document.getElementById("slideTitle");
const saveBtn = document.getElementById("saveBtn");
const savedList = document.getElementById("savedList");

/* 一括削除 */
const clearAllBtn = document.createElement("button");
clearAllBtn.textContent = "保存項目をすべて削除";
clearAllBtn.onclick = () => {
  if (!confirm("全削除しますか？")) return;
  PptxStore.clearAll();
  savedList.innerHTML = "";
};
savedList.before(clearAllBtn);

/* 保存 */
saveBtn.addEventListener("click", () => {
  const title = slideTitleInput.value.trim();
  if (!title) {
    alert("タイトルを入力してください");
    return;
  }

  const key = Date.now().toString(); // ★ 常に一意

  const data = {
    title,
    savedAt: nowString(),
    min: min.value,
    max: max.value,
    demand: demand.value,
    content: promput.value,
    code: codeInput.value
  };

  PptxStore.save(key, data);
  addSavedItem(key, data);
});

/* 表示 */
function addSavedItem(key, data) {
  const d = document.createElement("details");
  const s = document.createElement("summary");
  s.textContent = `${data.title}（${data.savedAt}）`;

  const load = document.createElement("button");
  load.textContent = "入力";
  load.onclick = () => restoreData(data);

  const del = document.createElement("button");
  del.textContent = "削除";
  del.onclick = () => {
    if (!confirm("削除しますか？")) return;
    PptxStore.remove(key);
    d.remove();
  };

  s.append(load, del);
  d.append(s);

  const pre = document.createElement("pre");
  pre.textContent =
    `【保存日時】\n${data.savedAt}\n\n【その他条件】\n${data.demand}\n\n【スライド内容】\n${data.content}\n\n【コード】\n${data.code}`;

  d.append(pre);
  savedList.prepend(d);
}

/* 復元 */
function restoreData(data) {
  slideTitleInput.value = data.title;
  min.value = data.min;
  max.value = data.max;
  demand.value = data.demand;
  promput.value = data.content;
  codeInput.value = data.code;
}

/* 初期復元 */
window.addEventListener("DOMContentLoaded", () => {
  PptxStore.loadAll().forEach(o => addSavedItem(o.key, o.data));
});
