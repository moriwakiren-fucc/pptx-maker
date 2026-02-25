function copyButton(elementId) {
  const element = document.getElementById(elementId);
  const text = element.innerText; // ← textContent ではなく innerText

  fallbackCopy(text);
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;

  // Safari 対策（重要）
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";

  document.body.appendChild(textarea);

  // ★ Safari では focus が必須
  textarea.focus();
  textarea.select();

  let success = false;
  try {
    success = document.execCommand("copy");
  } catch (e) {
    success = false;
  }

  document.body.removeChild(textarea);

  if (!success) {
    alert("コピーに失敗しました（ブラウザ制限）");
  }
}

// ===== PPTX 実行部分 =====

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
    errorBox.textContent = "構文または実行エラー:\n\n" + err.message;
  }
});
