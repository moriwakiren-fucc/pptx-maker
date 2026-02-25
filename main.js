function copyButton(elementId) {
    const prompt = document.getElementById('prompt');
    var element = document.getElementById(elementId);
    // 3. .value で入力値を取得
    var copytext = prompt + element.value;
    // 上記要素をクリップボードにコピーする
    navigator.clipboard.writeText(copytext)
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
