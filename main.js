function copyButton(elementId) {
    // 引数で得たIDの要素のテキストを取得
    var element = document.getElementById(elementId);
    
    // 上記要素をクリップボードにコピーする
    navigator.clipboard.writeText(element.textContent)
}
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
