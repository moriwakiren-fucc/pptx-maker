function copyButton() {
  const promptBox = document.getElementById("prompt");
  const min = document.getElementById("min").value || "";
  const max = document.getElementById("max").value || "";
  const demand = document.getElementById("demand").value || "";
  const content = document.getElementById("promput").value || "";

  const baseText = promptBox.cloneNode(true);
  baseText.querySelectorAll("input, textarea").forEach(el => el.remove());

  let result = baseText.textContent
    .trim()
    .replace("- スライドの枚数は枚以上枚以下とする", `- スライドの枚数は ${min} 枚以上 ${max} 枚以下とする`)
    .replace("\n以下の欄にその他の条件を記入することもできます。", demand)
    + content;

  navigator.clipboard.writeText(result);

  const btn = document.getElementById("copybutton");
  btn.textContent = "コピー完了";

  // ★ ここを追加
  setTimeout(() => {
    btn.textContent = "コピーする";
  }, 2000);
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
