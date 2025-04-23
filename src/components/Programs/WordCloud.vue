<template>
    <div>
        <h4>Word Cloud Generator</h4>
        <div id="controls">
            <label>选择本地文件:
                <input type="file" @change="handleFileUpload($event.target.files[0])" accept=".txt">
            </label>
            <button @click="loadDefaultFile()">使用默认文件</button>
            <button @click="generateWordCloud()">点击生成词云图</button>
            <button @click="randomizeSettings()">随机设置展示样式</button>
            <button @click="downloadWordCloud()">下载词云图</button>
            <div class="break-after"></div>
            <label>颜色: <input type="color" v-model="colorValue"></label>
            <label>旋转: <input type="checkbox" v-model="rotateEnabled"></label>
            <label>彩虹色:
                <input type="checkbox" v-model="rainbowEnabled">
            </label>
            <label>展示数量:
                <select v-model="wordCount">
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="300">300</option>
                    <option value="400">400</option>

                </select>
            </label>
            <label>画布大小:
                <input type="number" v-model.number="width" @change="generateWordCloud($refs.wordCloudSvg)"> x
                <input type="number" v-model.number="height" @change="generateWordCloud($refs.wordCloudSvg)">
            </label>
        </div>

        <div id="loading">正在加载中...</div>
        <svg ref="wordCloudSvg" id="wordCloud"></svg>
    </div>
</template>
<script setup>

import { ref } from 'vue'

import * as d3 from 'd3';
import cloud from 'd3-cloud';

const useWordCloud = () => {
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
            alert("默认文件加载完成！")
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

            cloud()
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
                    alert("词云图生成完成！")
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

            img.onload = function () {
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

const {
    // 状态
    width,
    height,
    colorValue,
    rotateEnabled,
    rainbowEnabled,
    wordCount,
    // 方法
    loadDefaultFile,
    generateWordCloud,
    randomizeSettings,
    downloadWordCloud,
    handleFileUpload
} = useWordCloud()


</script>
<style scoped>
body {
    font-family: 'Comic Sans MS', cursive, sans-serif;
    background: linear-gradient(135deg, #ffe6f0 0%, #e6f9ff 100%);
    min-height: 100vh;
    padding: 10px;
    margin: 0;
    color: #6a4a7a;
    /* cursor: none !important; */
}

h4 {
    text-align: center;
    color: #ff85a2;
    text-shadow: 2px 2px #ffd3e6;
    font-size: 1.8em;
    margin-bottom: 15px;
}

a {
    color: #696666;
    text-decoration: none;
}

a:hover {
    color: #e1734a;
    cursor: none !important;
}

#controls {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    /* 居中 */
    align-items: center;
    background: linear-gradient(145deg, #ffffff, #e6f7ff);
    border: 2px dashed #b3e0ff;
    gap: 10px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 15px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 15px;
}

.break-after {
    flex-basis: 100%;
    height: 0;
}


.highlighted {
    fill: #ff4d88 !important;
    font-weight: bold;
    text-shadow: 0 0 4px rgba(255, 0, 128, 0.4);
}

label select {
    min-width: 120px;
}

label:hover,
input[type="file"]:hover,
input[type="number"]:hover,
select:hover {
    transform: scale(1.03);
}


button {
    background: #ff9eb5;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    box-shadow: 0 3px 6px rgba(255, 158, 181, 0.3);
}

button:hover {
    background: #ff7aa2;
    transform: translateY(-2px);
    box-shadow: 0 5px 10px rgba(255, 122, 162, 0.4);
    cursor: none !important;
}

label {
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(182, 216, 242, 0.3);
    padding: 5px 8px;
    border-radius: 20px;
    transition: all 0.3s ease;
}

label:hover {
    background: rgba(182, 216, 242, 0.5);
}

input[type="file"],
input[type="number"],
select {
    padding: 8px;
    border: 2px solid #ffb3d9;
    border-radius: 15px;
    background: white;
    font-family: inherit;
}

input[type="color"] {
    width: 30px;
    height: 30px;
    border: 0px solid #ffb3d9;
    /* border-radius: 50%; */
    /* padding: 3px; */
    cursor: pointer;
}

#loading {
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #ff9eb5;
    color: white;
    padding: 20px 40px;
    border-radius: 30px;
    font-size: 1.0em;
    box-shadow: 0 5px 15px rgba(255, 158, 181, 0.5);
}

#wordCloud {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin: 0 auto;
    display: block;
    max-width: 100%;
    height: auto;
}


body::before {
    content: "";
    position: fixed;
    width: 200px;
    height: 100px;
    background: white;
    border-radius: 100px;
    top: 50px;
    left: -50px;
    opacity: 0.3;
    transform: rotate(-30deg);
    z-index: -1;
}

body::after {
    content: "";
    position: fixed;
    width: 150px;
    height: 75px;
    background: #ffd3e6;
    border-radius: 75px;
    bottom: 30px;
    right: -30px;
    opacity: 0.4;
    transform: rotate(20deg);
    z-index: -1;
}

canvas {
    display: none !important;
    opacity: 0;
    z-index: -1;
}
</style>