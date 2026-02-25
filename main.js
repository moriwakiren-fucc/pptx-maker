document.getElementById("runBtn").addEventListener("click", runCode);

function runCode() {
  const log = document.getElementById("log");
  log.textContent = "";

  try {
    /* ========= Node.js 風環境の吸収 ========= */

    window.require = function (name) {
      if (name === "pptxgenjs") {
        return PptxGenJS;
      }
      throw new Error("Module not found: " + name);
    };

    window.pptxgen = function () {
      return new PptxGenJS();
    };

    /* ========= writeFile の差異吸収 ========= */

    const originalWriteFile = PptxGenJS.prototype.writeFile;
    PptxGenJS.prototype.writeFile = function (arg) {
      if (typeof arg === "object" && arg.fileName) {
        return originalWriteFile.call(this, arg.fileName);
      }
      return originalWriteFile.call(this, arg);
    };

    /* ========= ユーザーコード実行 ========= */

    const userCode = document.getElementById("code").value;
    new Function(userCode)();

    log.textContent = "✅ スライド生成成功（ダウンロードが開始されます）";
  } catch (e) {
    log.textContent = "❌ エラー\n" + e.message;
    console.error(e);
  }
}
