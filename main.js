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
    .replace("以下の欄にその他の条件を記入することもできます。", demand)
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
