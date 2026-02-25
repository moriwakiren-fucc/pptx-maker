document.getElementById("runBtn").addEventListener("click", runCode);

function runCode() {
  const log = document.getElementById("log");
  const preview = document.getElementById("preview");
  log.textContent = "";
  preview.innerHTML = "";

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


    /* ===== プレビュー用フック ===== */

    const slides = [];
    const originalAddSlide = PptxGenJS.prototype.addSlide;

    PptxGenJS.prototype.addSlide = function () {
      const slide = originalAddSlide.call(this);
      slide.__texts = [];
      slides.push(slide);

      const originalAddText = slide.addText;
      slide.addText = function (text, options) {
        slide.__texts.push(text);
        return originalAddText.call(this, text, options);
      };

      return slide;
    };

    /* ===== ユーザーコード実行 ===== */

    const userCode = document.getElementById("code").value;
    new Function(userCode)();

    /* ===== プレビュー描画 ===== */

    slides.forEach((slide, i) => {
      const div = document.createElement("div");
      div.className = "slide-preview";
      div.innerHTML =
        `<strong>Slide ${i + 1}</strong><br>` +
        (slide.__texts.length
          ? slide.__texts.join("<br>")
          : "(テキストなし)");
      preview.appendChild(div);
    });

    log.textContent = "✅ スライド生成成功（ダウンロード開始）";

  } catch (e) {
    /* ===== エラー時のみ構文チェック ===== */

    try {
      new Function(document.getElementById("code").value);
    } catch (syntaxError) {
      log.textContent =
        "❌ 構文エラー\n" + syntaxError.message;
      return;
    }

    log.textContent =
      "❌ 実行時エラー\n" + e.message;
    console.error(e);
  }
}
