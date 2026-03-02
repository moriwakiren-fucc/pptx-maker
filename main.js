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

  const userCode = codeInput.value;

  try {
    const wrapper = new Function(
      "PptxGenJS",
      `"use strict";\n${userCode}`
    );
    wrapper(PptxGenJS);

  } catch (err) {
    errorBox.textContent = formatError(err, userCode);
  }
});

/* ------------------------------
   エラー整形（行番号対応）
------------------------------ */
function formatError(err, code) {
  let message = "エラーが発生しました\n\n";
  message += `種類: ${err.name}\n`;
  message += `内容: ${err.message}\n`;

  if (err.stack) {
    const match = err.stack.match(/<anonymous>:(\d+):(\d+)/);
    if (match) {
      const line = Number(match[1]) - 1; // "use strict" 分を引く
      const col = match[2];

      const codeLines = code.split("\n");
      const errorLine = codeLines[line - 1] || "";

      message += `行番号: ${line}\n`;
      message += `列番号: ${col}\n\n`;
      message += "該当行:\n";
      message += errorLine;
    }
  }

  return message;
}

/* ------------------------------
   入力欄フォーカス解除
------------------------------ */
document.addEventListener(
  "pointerdown",
  (e) => {
    const active = document.activeElement;

    if (
      active &&
      (active.tagName === "INPUT" || active.tagName === "TEXTAREA") &&
      !active.contains(e.target)
    ) {
      active.blur();
    }
  },
  true
);

// ===============================
// pptx 保存専用ストレージ
// ===============================
const PptxStore = {
  prefix: "pptx_",

  save(title, data) {
    localStorage.setItem(
      this.prefix + title,
      JSON.stringify(data)
    );
  },

  load(title) {
    const raw = localStorage.getItem(this.prefix + title);
    return raw ? JSON.parse(raw) : null;
  },

  loadAll() {
    return Object.keys(localStorage)
      .filter(k => k.startsWith(this.prefix))
      .map(k => {
        try {
          return JSON.parse(localStorage.getItem(k));
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  },

  remove(title) {
    localStorage.removeItem(this.prefix + title);
  },

  clearAll() {
     Object.keys(localStorage)
        .filter(k => k.startsWith(this.prefix))
        .forEach(k => localStorage.removeItem(k));
  }
};

// ===============================
// 保存・復元機能（拡張版）
// ===============================

function extractPptxTitle(code) {
  const match = code.match(/writeFile\s*\(\s*["'`](.+?)["'`]\s*\)/);
  return match ? match[1].replace(/\.pptx$/i, "") : "";
}

function nowString() {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")} ` +
         `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

const slideTitleInput = document.getElementById("slideTitle");
const saveBtn = document.getElementById("saveBtn");
const savedList = document.getElementById("savedList");

// 一括削除ボタン
const clearAllBtn = document.createElement("button");
clearAllBtn.textContent = "保存項目をすべて削除";
clearAllBtn.style.marginBottom = "8px";
clearAllBtn.onclick = () => {
  if (!confirm("保存されたすべての項目を削除します。よろしいですか？")) return;
   PptxStore.clearAll();
   savedList.innerHTML = "";
};
savedList.before(clearAllBtn);

// タイトル自動補完
codeInput.addEventListener("input", () => {
  if (slideTitleInput.value.trim()) return;
  const title = extractPptxTitle(codeInput.value);
  if (title) slideTitleInput.value = title;
});

// 保存処理
saveBtn.addEventListener("click", () => {
  let title = slideTitleInput.value.trim();
  if (!title) {
    alert("タイトルを入力してください");
    return;
  }

  const baseKey = "pptx_" + title;
  if (localStorage.getItem(baseKey)) {
    const choice = prompt(
      "同じタイトルが存在します。\n\n" +
      "1: 置き換える\n" +
      "2: 両方保存する\n" +
      "その他: キャンセル\n\n" +
      "番号を入力してください"
    );

    if (choice === "1") {
      // そのまま上書き
    } else if (choice === "2") {
      let i = 2;
      while (localStorage.getItem(`pptx_${title}_${i}`)) i++;
      title = `${title}_${i}`;
    } else {
      return;
    }
  }

  const data = {
    title,
    savedAt: nowString(),
    min: document.getElementById("min")?.value || "",
    max: document.getElementById("max")?.value || "",
    demand: document.getElementById("demand")?.value || "",
    content: document.getElementById("promput")?.value || "",
    code: codeInput.value || ""
  };

   PptxStore.save(title, data);
   addSavedItem(data);
});

// 保存表示
function addSavedItem(data) {
  const wrapper = document.createElement("details");

  const summary = document.createElement("summary");
  summary.textContent = `${data.title}（${data.savedAt}）`;

  const loadBtn = document.createElement("button");
  loadBtn.textContent = "入力";
  loadBtn.style.marginLeft = "8px";
  loadBtn.onclick = () => restoreData(data);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "削除";
  deleteBtn.style.marginLeft = "4px";
  deleteBtn.onclick = () => {
    if (!confirm(`「${data.title}」を削除しますか？`)) return;
    localStorage.removeItem("pptx_" + data.title);
    wrapper.remove();
  };

  summary.append(loadBtn, deleteBtn);
  wrapper.appendChild(summary);

  const pre = document.createElement("pre");
  pre.textContent =
    "【保存日時】\n" + data.savedAt +
    "\n\n【その他条件】\n" + data.demand +
    "\n\n【スライド内容】\n" + data.content +
    "\n\n【pptxgenjsコード】\n" + data.code;

  wrapper.appendChild(pre);
  savedList.prepend(wrapper);
}

// 復元
function restoreData(data) {
  slideTitleInput.value = data.title;
  document.getElementById("min").value = data.min;
  document.getElementById("max").value = data.max;
  document.getElementById("demand").value = data.demand;
  document.getElementById("promput").value = data.content;
  codeInput.value = data.code;
}

// ===============================
// ページ読み込み時に保存一覧を復元
// ===============================
window.addEventListener("DOMContentLoaded", () => {
  PptxStore.loadAll().forEach(addSavedItem);
});
