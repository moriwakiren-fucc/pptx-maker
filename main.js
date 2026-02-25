let pptx = null
let generated = false

document.getElementById("generateBtn").addEventListener("click", () => {
  const code = document.getElementById("codeInput").value
  const preview = document.getElementById("previewArea")

  try {
    pptx = new PptxGenJS()
    generated = false

    const log = []

    const slideProxy = {
      addSlide() {
        log.push("スライドを1枚追加")
        return pptx.addSlide()
      }
    }

    const userFunc = new Function("pptx", "log", code)
    userFunc(pptx, log)

    preview.textContent = log.join("\n")
    generated = true
    document.getElementById("downloadBtn").disabled = false

  } catch (e) {
    preview.textContent = "エラー:\n" + e.message
  }
})

document.getElementById("downloadBtn").addEventListener("click", () => {
  if (pptx && generated) {
    pptx.writeFile("generated.pptx")
  }
})
