let rawText = '';
let words = [];

document.getElementById('fileInput').addEventListener('change', async function (e) {
    const file = e.target.files[0];
    if (file) {
        showLoading(true);
        try {
            rawText = await readFileAsync(file);
            console.log("[LOG] 文件内容预览:", rawText.substring(0, 100));
            alert("文件上传成功，现在点击生成词云图看看效果吧！");
        } catch (error) {
            console.error("[ERROR] 文件处理失败:", error);
            alert(`文件处理失败: ${error.message}`);
            rawText = '';
        } finally {
            showLoading(false);
        }
    }
});


function showLoading(isLoading) {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = isLoading ? 'block' : 'none';
    // 禁用所有按钮和控件
    document.querySelectorAll('#controls button, #controls input, #controls select').forEach(control => {
        control.disabled = isLoading;
    });
}

function readFileAsync(file) {
    console.log("[DEBUG] 开始读取文件:", file.name, file.size);
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result); // 直接获取字符串内容
        reader.onerror = () => reject(new Error("文件读取失败"));
        reader.readAsText(file, 'UTF-8');
    });
}

async function loadDefaultFile() {
    showLoading(true);
    try {
        const response = await fetch('./llm.txt');
        rawText = await response.text();
        console.log("[LOG] 默认文件读取完成，字数：", rawText.length);
    } catch (e) {
        console.error("[ERROR] 读取默认文件失败:", e);
    }
    showLoading(false);
}


function tokenize(text) {
    console.log("[DEBUG] 原始文本:", text); // 检查实际内容
    const result = text.toLowerCase()
        .replace(/[^a-zA-Z\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3);
    console.log("[DEBUG] 分词结果:", result);
    return result;
}

function countWords(words) {
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    return Object.entries(freq).map(([word, count]) => ({ text: word, size: count }));
}

function generateWordCloud() {

console.log("[DEBUG] rawText状态:", {
    isNull: rawText === null,
    isUndefined: rawText === undefined,
    length: rawText?.length,
    preview: rawText?.substring(0, 50)
});
    const width = +document.getElementById('width').value;
    const height = +document.getElementById('height').value;
    const rotate = document.getElementById('rotateToggle').checked;
    const color = document.getElementById('colorPicker').value;
    const maxWords = +document.getElementById('wordCount').value;
    const isRainbow = document.getElementById("rainbowToggle").checked;


    if (!rawText || rawText.trim().length === 0) {
        alert("请先加载有效的文本文件（内容不能为空）");
        return;
    }

    showLoading(true);

    const tokens = tokenize(rawText);
    console.log("[LOG] 分词完成，总词数：", tokens.length);

    let wordData = countWords(tokens)
        .sort((a, b) => b.size - a.size)
        .slice(0, maxWords);

    console.log("[DEBUG] Top 10 词频：", wordData.slice(0, 10));

    // 先尝试使用自动 font size 区间
    const maxFreq = wordData[0].size;
    const minFreq = wordData[wordData.length - 1].size;
    let maxFont = Math.min(60, Math.floor(Math.min(width, height) / 10));
    let minFont = Math.max(8, Math.floor(maxFont / 3));
    let attempts = 0;

    function tryLayout(minF, maxF) {
        const scale = d3.scaleLinear()
            .domain([minFreq, maxFreq])
            .range([minF, maxF]);

        const layoutWords = wordData.map(d => ({
            text: d.text,
            size: scale(d.size),
            customXY: null
        }));

        console.log(`[DEBUG] 尝试绘制 fontSize 范围：${minF} ~ ${maxF}`);

        d3.select("#wordCloud").html("")
            .attr("width", width)
            .attr("height", height);

        d3.layout.cloud()
            .size([width, height])
            .words(layoutWords)
            .spiral('archimedean')
            .padding(1)
            .rotate(() => {
                if (!rotate) return 0;
                const rand = Math.random();
                if (rand < 0.3) return 0;
                else if (rand < 0.5) return 90;
                else return Math.floor(Math.random() * 61) - 30;
            })


            .font("Impact")
            .fontSize(d => d.size)
            .on("end", words => {
                console.log("[DEBUG] 实际绘制词数量：", words.length);
                if (words.length === 0 && attempts < 5) {
                    attempts++;
                    maxFont = Math.floor(maxFont * 0.85);
                    minFont = Math.floor(minFont * 0.85);
                    console.warn(`[WARN] 第 ${attempts} 次重试，字体太大？缩小后重试...`);
                    tryLayout(minFont, maxFont);
                    return;
                }

                d3.select("#wordCloud")
                    .append("g")
                    .attr("transform", `translate(${width / 2},${height / 2})`)
                    .selectAll("text")
                    .data(words)
                    .enter().append("text")
                    .style("font-size", d => `${d.size}px`)
                    .style("fill", (d, i) => isRainbow ? getRainbowColor(i, words.length) : color)
                    .style("font-family", "Impact")
                    .attr("text-anchor", "middle")
                    .attr("transform", d => {
                        const [x, y] = d.customXY || [d.x, d.y];
                        return `translate(${x},${y}) rotate(${d.rotate})`;
                    })
                    .on("mouseover", function () {
                        d3.select(this).style("fill", d3.color(color).darker(1));
                    })
                    .on("mouseout", function () {
                        d3.select(this).style("fill", isRainbow ? 
                            getRainbowColor(Array.from(this.parentNode.children).indexOf(this), words.length) : 
                            color);
                    })
                    .text(d => d.text);

                showLoading(false);
                console.log("[LOG] 词云绘制完成，共绘制词数：", words.length);
            })
            .start();
    }

    tryLayout(minFont, maxFont);
}

// 彩虹色生成函数
function getRainbowColor(index, total) {
    const hue = (index / total) * 360;
    return `hsl(${hue}, 100%, 50%)`;
}

// 下载词云图功能
function downloadWordCloud() {
    const svg = document.getElementById("wordCloud");
    if (!svg || svg.children.length === 0) {
        alert("请先生成词云图");
        return;
    }

    showLoading(true);
    
    // 创建canvas用于转换
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = svg.width.baseVal.value;
    canvas.height = svg.height.baseVal.value;
    
    // 将SVG转换为图像数据
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        
        // 触发下载
        const link = document.createElement("a");
        link.download = "wordcloud.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        showLoading(false);
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
}
function randomizeSettings() {
    const colors = ['#BFECFF', '#CDC1FF', '#FFCCEA', '#B1AFFF'];
    const widths = [400, 600, 800, 1000];
    const counts = [100, 200, 300, 400];

    // 随机选择颜色
    document.getElementById('colorPicker').value = colors[Math.floor(Math.random() * colors.length)];
    
    // 随机选择是否旋转
    document.getElementById('rotateToggle').checked = Math.random() > 0.5;
    
    // 随机选择宽度和高度
    document.getElementById('width').value = widths[Math.floor(Math.random() * widths.length)];
    document.getElementById('height').value = widths[Math.floor(Math.random() * widths.length)];
    
    // 随机选择展示数量
    document.getElementById('wordCount').value = counts[Math.floor(Math.random() * counts.length)];
    
    // 随机选择是否启用彩虹色
    document.getElementById('rainbowToggle').checked = Math.random() > 0.5;

    console.log("[LOG] 随机参数设置完成");
}
