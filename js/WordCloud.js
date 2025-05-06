// WordCloud.js
import * as d3 from 'd3'
import 'd3-cloud'

export const useWordCloud = () => {
  // 状态数据
  const state = {
    rawText: '',
    words: [],
    isLoading: false,
    width: ref(600),
    height: ref(400),
    rotateEnabled: ref(false),
    colorValue: ref('#000000'),
    rainbowEnabled: ref(false),
    wordCount: ref(100)
  }

  // 辅助函数
  const showLoading = (isLoading) => {
    state.isLoading = isLoading
  }

  const readFileAsync = (file) => {
    console.log("[DEBUG] 开始读取文件:", file.name, file.size)
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = () => reject(new Error("文件读取失败"))
      reader.readAsText(file, 'UTF-8')
    })
  }

  const tokenize = (text) => {
    console.log("[DEBUG] 原始文本:", text)
    return text.toLowerCase()
      .replace(/[^a-zA-Z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3)
  }

  const countWords = (words) => {
    const freq = {}
    words.forEach(w => freq[w] = (freq[w] || 0) + 1)
    return Object.entries(freq).map(([word, count]) => ({ text: word, size: count }))
  }

  // 彩虹色生成函数
  const getRainbowColor = (index, total) => {
    const hue = (index / total) * 360
    return `hsl(${hue}, 100%, 50%)`
  }

  // 主要功能方法
  const handleFileUpload = async (file) => {
    if (!file) return
    
    showLoading(true)
    try {
      state.rawText = await readFileAsync(file)
      console.log("[LOG] 文件内容预览:", state.rawText.substring(0, 100))
    } catch (error) {
      console.error("[ERROR] 文件处理失败:", error)
      state.rawText = ''
      throw error
    } finally {
      showLoading(false)
    }
  }

  const loadDefaultFile = async () => {
    showLoading(true)
    try {
      const response = await fetch('/data/llm.txt')
      state.rawText = await response.text()
      console.log("[LOG] 默认文件读取完成，字数：", state.rawText.length)
    } catch (e) {
      console.error("[ERROR] 读取默认文件失败:", e)
      throw e
    } finally {
      showLoading(false)
    }
  }

  const generateWordCloud = (svgElement) => {
    if (!state.rawText || state.rawText.trim().length === 0) {
      throw new Error("请先加载有效的文本文件（内容不能为空）")
    }

    showLoading(true)

    const tokens = tokenize(state.rawText)
    console.log("[LOG] 分词完成，总词数：", tokens.length)

    let wordData = countWords(tokens)
      .sort((a, b) => b.size - a.size)
      .slice(0, state.wordCount.value)

    console.log("[DEBUG] Top 10 词频：", wordData.slice(0, 10))

    // 计算字体大小范围
    const maxFreq = wordData[0].size
    const minFreq = wordData[wordData.length - 1].size
    let maxFont = Math.min(60, Math.floor(Math.min(state.width.value, state.height.value) / 10))
    let minFont = Math.max(8, Math.floor(maxFont / 3))
    let attempts = 0

    const tryLayout = (minF, maxF) => {
      const scale = d3.scaleLinear()
        .domain([minFreq, maxFreq])
        .range([minF, maxF])

      const layoutWords = wordData.map(d => ({
        text: d.text,
        size: scale(d.size),
        customXY: null
      }))

      console.log(`[DEBUG] 尝试绘制 fontSize 范围：${minF} ~ ${maxF}`)

      d3.select(svgElement).html("")
        .attr("width", state.width.value)
        .attr("height", state.height.value)

      d3.layout.cloud()
        .size([state.width.value, state.height.value])
        .words(layoutWords)
        .spiral('archimedean')
        .padding(1)
        .rotate(() => {
          if (!state.rotateEnabled.value) return 0
          const rand = Math.random()
          if (rand < 0.3) return 0
          else if (rand < 0.5) return 90
          else return Math.floor(Math.random() * 61) - 30
        })
        .font("Impact")
        .fontSize(d => d.size)
        .on("end", words => {
          console.log("[DEBUG] 实际绘制词数量：", words.length)
          if (words.length === 0 && attempts < 5) {
            attempts++
            maxFont = Math.floor(maxFont * 0.85)
            minFont = Math.floor(minFont * 0.85)
            console.warn(`[WARN] 第 ${attempts} 次重试，字体太大？缩小后重试...`)
            tryLayout(minFont, maxFont)
            return
          }

          d3.select(svgElement)
            .append("g")
            .attr("transform", `translate(${state.width.value / 2},${state.height.value / 2})`)
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", d => `${d.size}px`)
            .style("fill", (d, i) => state.rainbowEnabled.value ? getRainbowColor(i, words.length) : state.colorValue.value)
            .style("font-family", "Impact")
            .attr("text-anchor", "middle")
            .attr("transform", d => {
              const [x, y] = d.customXY || [d.x, d.y]
              return `translate(${x},${y}) rotate(${d.rotate})`
            })
            .on("mouseover", function () {
              d3.select(this).style("fill", d3.color(state.colorValue.value).darker(1))
            })
            .on("mouseout", function () {
              d3.select(this).style("fill", state.rainbowEnabled.value ? 
                getRainbowColor(Array.from(this.parentNode.children).indexOf(this), words.length) : 
                state.colorValue.value)
            })
            .text(d => d.text)

          showLoading(false)
          console.log("[LOG] 词云绘制完成，共绘制词数：", words.length)
        })
        .start()
    }

    tryLayout(minFont, maxFont)
  }

  const downloadWordCloud = (svgElement) => {
    if (!svgElement || svgElement.children.length === 0) {
      throw new Error("请先生成词云图")
    }

    showLoading(true)
    
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      canvas.width = svgElement.width.baseVal.value
      canvas.height = svgElement.height.baseVal.value
      
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const img = new Image()
      
      img.onload = function() {
        ctx.drawImage(img, 0, 0)
        
        const link = document.createElement("a")
        link.download = "wordcloud.png"
        link.href = canvas.toDataURL("image/png")
        link.click()
        
        showLoading(false)
        resolve()
      }
      
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
    })
  }

  const randomizeSettings = () => {
    const colors = ['#BFECFF', '#CDC1FF', '#FFCCEA', '#B1AFFF']
    const widths = [400, 600, 800, 1000]
    const counts = [100, 200, 300, 400]

    state.colorValue.value = colors[Math.floor(Math.random() * colors.length)]
    state.rotateEnabled.value = Math.random() > 0.5
    state.width.value = widths[Math.floor(Math.random() * widths.length)]
    state.height.value = widths[Math.floor(Math.random() * widths.length)]
    state.wordCount.value = counts[Math.floor(Math.random() * counts.length)]
    state.rainbowEnabled.value = Math.random() > 0.5

    console.log("[LOG] 随机参数设置完成")
  }

  return {
    ...state,
    handleFileUpload,
    loadDefaultFile,
    generateWordCloud,
    downloadWordCloud,
    randomizeSettings
  }
}
