const sleep = (time) => new Promise((r) => setTimeout(r, time));//timeはミリ秒

async function taiki(sec){
	await sleep(sec * 1000);
}

function copyButton() {
  const promptBox = document.getElementById("prompt");
  const min = document.getElementById("min").value || "";
  const max = document.getElementById("max").value || "";
  const demand = document.getElementById("demand").value || "";
  const content = document.getElementById("promput").value || "";

  // pre内の「純テキスト部分」だけ取得
  const baseText = promptBox.cloneNode(true);

  // input / textarea を除去（文字化け防止）
  baseText.querySelectorAll("input, textarea").forEach(el => el.remove());
  let result = baseText.textContent.trim().replace("- スライドの枚数は枚以上枚以下とする", `- スライドの枚数は ${min} 枚以上 ${max} 枚以下とする`)+content;

  navigator.clipboard.writeText(result);
  const btn = document.getElementById('copybutton');
  btn.textContent = 'コピー完了';
  taiki(1)
  btn.textContent = 'コピーする';
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
