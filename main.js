function copyButton(elementId) {
  const element = document.getElementById(elementId);
  const text = element.textContent;

  // Clipboard API が使える場合（HTTPS / localhost）
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).catch(() => {
      fallbackCopy(text);
    });
  } else {
    // file:// や HTTP 用のフォールバック
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand("copy");
  } catch (e) {
    alert("コピーに失敗しました");
  }

  document.body.removeChild(textarea);
}

// ====== 既存処理 ======

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
