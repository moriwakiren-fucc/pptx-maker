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
// 保存・復元機能
// ===============================

// pptxコードからファイル名を推測
function extractPptxTitle(code) {
  const match = code.match(/writeFile\s*\(\s*["'`](.+?)["'`]\s*\)/);
  return match ? match[1].replace(/\.pptx$/i, "") : "";
}

const slideTitleInput = document.getElementById("slideTitle");
const saveBtn = document.getElementById("saveBtn");
const savedList = document.getElementById("savedList");

// codeInputが変更されたらタイトル自動補完
codeInput.addEventListener("input", () => {
  if (slideTitleInput.value.trim() !== "") return;
  const title = extractPptxTitle(codeInput.value);
  if (title) slideTitleInput.value = title;
});

saveBtn.addEventListener("click", () => {
  const title = slideTitleInput.value.trim();

  if (!title) {
    alert("タイトルを入力してください");
    return;
  }

  const data = {
    title,
    min: document.getElementById("min")?.value || "",
    max: document.getElementById("max")?.value || "",
    demand: document.getElementById("demand")?.value || "",
    content: document.getElementById("promput")?.value || "",
    code: codeInput.value || ""
  };

  localStorage.setItem("pptx_" + title, JSON.stringify(data));
  addSavedItem(data);
});

// 保存済みデータを表示
function addSavedItem(data) {
  const wrapper = document.createElement("details");

  const summary = document.createElement("summary");
  summary.textContent = data.title;

  const loadBtn = document.createElement("button");
  loadBtn.textContent = "入力";
  loadBtn.style.marginLeft = "8px";
  loadBtn.onclick = () => restoreData(data);

  summary.appendChild(loadBtn);
  wrapper.appendChild(summary);

  const pre = document.createElement("pre");
  pre.textContent =
    "【カスタム条件】\n" + data.demand +
    "\n\n【スライド内容】\n" + data.content +
    "\n\n【pptxgenjsコード】\n" + data.code;

  wrapper.appendChild(pre);
  savedList.prepend(wrapper);
}

// 入力欄へ復元
function restoreData(data) {
  slideTitleInput.value = data.title;
  document.getElementById("min").value = data.min;
  document.getElementById("max").value = data.max;
  document.getElementById("demand").value = data.demand;
  document.getElementById("promput").value = data.content;
  codeInput.value = data.code;
}
