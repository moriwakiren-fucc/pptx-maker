document.getElementById("runBtn").addEventListener("click", runCode);

function runCode() {
  const log = document.getElementById("log");
  const preview = document.getElementById("preview");
  log.textContent = "";
  preview.innerHTML = "";

  try {
    /* ===== Node.js 吸収 ===== */

    window.require = (name) => {
      if (name === "pptxgenjs") return PptxGenJS;
      throw new Error("Module not found: " + name);
    };
    window.pptxgen = () => new PptxGenJS();

    /* ===== writeFile 吸収 ===== */

    const originalWriteFile = PptxGenJS.prototype.writeFile;
    PptxGenJS.prototype.writeFile = function (arg) {
      return originalWriteFile.call(
        this,
        typeof arg === "object" ? arg.fileName : arg
      );
    };

    /* ===== プレビュー用フック ===== */

    const slides = [];
    const SLIDE_W = 960;
    const SLIDE_H = 540;

    const originalAddSlide = PptxGenJS.prototype.addSlide;
    PptxGenJS.prototype.addSlide = function () {
      const slide = originalAddSlide.call(this);
      slide.__elements = [];
      slides.push(slide);

      const originalAddText = slide.addText;
      slide.addText = function (text, opt = {}) {
        slide.__elements.push({ type: "text", text, opt });
        return originalAddText.call(this, text, opt);
      };

      const originalAddShape = slide.addShape;
      slide.addShape = function (shape, opt = {}) {
        slide.__elements.push({ type: "shape", shape, opt });
        return originalAddShape.call(this, shape, opt);
      };

      const originalAddImage = slide.addImage;
      slide.addImage = function (opt = {}) {
        slide.__elements.push({ type: "image", opt });
        return originalAddImage.call(this, opt);
      };

      return slide;
    };

    /* ===== ユーザーコード実行 ===== */

    new Function(document.getElementById("code").value)();

    /* ===== HTMLプレビュー描画 ===== */

    slides.forEach((slide, i) => {
      const slideDiv = document.createElement("div");
      slideDiv.className = "slide";
      slideDiv.style.width = SLIDE_W + "px";
      slideDiv.style.height = SLIDE_H + "px";

      slide.__elements.forEach(el => {
        if (el.type === "text") {
          const d = document.createElement("div");
          const o = el.opt;
          d.className = "text-box";
          d.textContent = el.text;
          applyBoxStyle(d, o);
          d.style.fontSize = (o.fontSize || 18) + "px";
          d.style.color = o.color || "#000";
          slideDiv.appendChild(d);
        }

        if (el.type === "shape") {
          const d = document.createElement("div");
          applyBoxStyle(d, el.opt);
          d.style.background = el.opt.fill || "#ddd";
          slideDiv.appendChild(d);
        }

        if (el.type === "image") {
          const img = document.createElement("img");
          applyBoxStyle(img, el.opt);
          img.src = el.opt.data || el.opt.path;
          slideDiv.appendChild(img);
        }
      });

      preview.appendChild(slideDiv);
    });

    log.textContent = "✅ スライド生成成功（高忠実プレビュー）";

  } catch (e) {
    try {
      new Function(document.getElementById("code").value);
      log.textContent = "❌ 実行時エラー\n" + e.message;
    } catch (se) {
      log.textContent = "❌ 構文エラー\n" + se.message;
    }
  }
}

function applyBoxStyle(el, o = {}) {
  const scale = 96;
  el.style.position = "absolute";
  el.style.left = (o.x || 0) * scale + "px";
  el.style.top = (o.y || 0) * scale + "px";
  el.style.width = (o.w || 1) * scale + "px";
  el.style.height = (o.h || 1) * scale + "px";
}
