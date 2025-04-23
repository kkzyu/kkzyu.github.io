<template>
    <div class="main-container">
        <h1>
            <div class="geeks">Greedy</div>snake
        </h1>
        <div class="game-container">
            <canvas ref = "boardCanvas"> </canvas>
            <!-- 操作面板 -->
            <div class="control-panel">
                <div class="score-board">
                    <h3>Score Board</h3>
                    <ol ref="highScoresList"></ol>
                    <div class="current-score">Current Score: <span ref="currentScore">0</span>
                    </div>
                </div>

                <div class="controls">
                    <!-- 必须包含以下按钮 -->
                    <button ref="startBtn">Start</button>
                    <button ref="pauseBtn">Pause</button>
                    <button ref="restartBtn">Restart</button>   
                </div>
            </div>

            <!-- 游戏结束弹窗 -->
            <div ref="gameOverModal" class="modal">
                <div class="modal-content">
                    <h2>Game Over</h2>
                    <p>Final Score: <span ref="finalScore">0</span></p>
                    <button ref="playAgainBtn">Play Again</button>
                </div>
            </div>
        </div>

    </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const blockSize = 25;
const total_row = 17;
const total_col = 17;
const boardCanvas = ref(null);
const startBtn = ref(null);
const pauseBtn = ref(null);
const restartBtn = ref(null);
const playAgainBtn = ref(null);
const finalScore = ref(null)
const currentScore = ref(0)
const highScoresList = ref(null)
const gameOverModal = ref(null)
const board = {
    width: total_col * blockSize,
    height: total_row * blockSize
}

let context
let snakeX = blockSize * 5
let snakeY = blockSize * 5
let speedX = 0
let speedY = 0
let snakeBody = []
let foodX
let foodY
let score = 0
let gameOver = false
let highScores = JSON.parse(localStorage.getItem('snakeHighScores')) || []
let gameInterval
let isPaused = false
let specialFood = null
let shieldActive = false
let baseSpeed = 10


// 生命周期
onMounted(() => {
  initGame()
  setupControls()
})

onUnmounted(() => {
  cleanup()
})

// 初始化游戏
function initGame() {
  // 画布设置
  boardCanvas.value.height = total_row * blockSize
  boardCanvas.value.width = total_col * blockSize
  context = boardCanvas.value.getContext('2d')

  // 初始状态
  pauseBtn.value.textContent = 'Pause'
  updateScoreBoard()
  placeFood()
  
  // 启动游戏循环
  baseSpeed = 8
  gameInterval = setInterval(update, 1000 / baseSpeed)
}


// 清理资源
function cleanup() {
  clearInterval(gameInterval)
  document.removeEventListener("keyup", changeDirection)
  pauseBtn.value?.removeEventListener('click', pauseHandler)
  startBtn.value?.removeEventListener('click', startHandler)
  restartBtn.value?.removeEventListener('click', resetGame)
  playAgainBtn.value?.removeEventListener('click', resetGame)
}

function update() {
        if (gameOver || isPaused) return;

        // 绘制渐变背景
        const gradient = context.createLinearGradient(0, 0, board.width, board.height);
        gradient.addColorStop(0, '#f8bbd0'); // 粉紫
        gradient.addColorStop(1, '#b3e5fc'); // 浅蓝
        context.fillStyle = gradient;
        context.fillRect(0, 0, board.width, board.height);


        // 食物系统
        drawFood();
        checkFoodCollision();

        // 蛇身更新
        updateSnakeBody();

        // 绘制蛇身（带圆角）
        context.fillStyle = "white";
        context.beginPath();
        context.roundRect(snakeX, snakeY, blockSize, blockSize, 5);
        context.fill();

        for (let i = 0; i < snakeBody.length; i++) {
            context.beginPath();
            context.roundRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize, 5);
            context.fill();
        }

        // 碰撞检测
        checkBoundaryCollision();
        checkSelfCollision();
    }

// 食物系统相关函数
function placeFood() {
        // 20%概率生成特殊食物
        if (Math.random() < 0.2) {
            specialFood = {
                x: Math.floor(Math.random() * total_col) * blockSize,
                y: Math.floor(Math.random() * total_row) * blockSize,
                type: ['speed', 'double', 'shield'][Math.floor(Math.random() * 3)]
            };
        } else {
            foodX = Math.floor(Math.random() * total_col) * blockSize;
            foodY = Math.floor(Math.random() * total_row) * blockSize;
            specialFood = null;
        }
    }

function drawFood() {
        // 绘制普通食物
        context.fillStyle = "yellow";
        context.fillRect(foodX, foodY, blockSize, blockSize);
        
        // 绘制特殊食物
        if (specialFood) {
            context.fillStyle = {
                'speed': '#00ffff',
                'double': '#ff00ff',
                'shield': '#ffff00'
            }[specialFood.type];
            context.beginPath();
            context.arc(
                specialFood.x + blockSize / 2,
                specialFood.y + blockSize / 2,
                blockSize / 2,
                0,
                Math.PI * 2
            );
            context.fill();
        }
    }

function checkFoodCollision() {
        // 普通食物碰撞
        if (snakeX === foodX && snakeY === foodY) {
            handleFoodConsumption();
            return;
        }

        // 特殊食物碰撞
        if (specialFood && snakeX === specialFood.x && snakeY === specialFood.y) {
            handleSpecialFood(specialFood.type);
            placeFood();
        }
    }

function handleFoodConsumption() {
        snakeBody.push([foodX, foodY]);
        score += 1;
        adjustDifficulty();
        updateScoreBoard();
        placeFood();
    }

function handleSpecialFood(type) {
        score += 2;
        switch (type) {
            case 'speed':
                baseSpeed += 2;
                adjustDifficulty();
                break;
            case 'double':
                snakeBody.push(...Array(2).fill([snakeX, snakeY]));
                break;
            case 'shield':
                shieldActive = true;
                setTimeout(() => shieldActive = false, 5000);
                break;
        }
        updateScoreBoard();
    }

// 游戏控制系统
function setupControls() {
        const startHandler = () =>  {
            if (!gameInterval) {
                gameInterval = setInterval(update, 1000 / baseSpeed);
            }
            alert('🐍 贪吃蛇游戏规则说明：\n🎮 基本玩法——\n1. 移动控制\n🕹️ 键盘方向键：w a s d 控制蛇的移动方向\n📱 触屏用户：在游戏区域滑动即可控制方向\n⚠️ 禁止反向移动：不能直接180度调头（如向下移动时不能立即向上）\n2. 得分机制\n🟡 普通食物：+1分（黄色方块）\n🔵 加速食物：+2分（蓝色圆球）并提升移动速度15秒\n🟣 双倍食物：+2分（紫色圆球）使蛇身增长双倍长度\n🛡️ 护盾食物：+2分（金色圆球）获得5秒碰撞免疫\n成长系统\n每吃1个食物蛇身增长1节\n双倍食物可使蛇身额外多增长1节\n蛇身最大长度无上限\n⚠️ 失败条件\n碰撞边界：蛇头触碰游戏区域边缘（护盾激活时除外）\n自我吞噬：蛇头触碰自己身体（护盾激活时除外）\n紧急停止：点击暂停按钮可随时冻结游戏\n🏆 进阶系统\n①每获得5分速度提升1级\n②速度等级显示在计分板（最高20级）\n③游戏重启后恢复初始速度')
        }
        startBtn.value.addEventListener('click', startHandler);
        document.addEventListener("keyup", changeDirection);
        const pauseHandler = function() {
            isPaused = !isPaused;
            this.textContent = isPaused ? 'Continue' : 'Pause';
            updateScoreBoard();
        }
        pauseBtn.value.addEventListener('click', pauseHandler);
        
        restartBtn.value.addEventListener('click', resetGame);
        playAgainBtn.value.addEventListener('click', resetGame);
    }

function resetGame() {
        clearInterval(gameInterval);
        snakeX = blockSize * 5;
        snakeY = blockSize * 5;
        snakeBody = [];
        speedX = 0;
        speedY = 0;
        score = 0;
        baseSpeed = 8;
        gameOver = false;
        isPaused = false;
        shieldActive = false;
        placeFood();
        updateScoreBoard();
        gameInterval = setInterval(update, 1000 / baseSpeed);
        gameOverModal.value.style.display = 'none';
    }

// 难度系统
function adjustDifficulty() {
        const newSpeed = baseSpeed + Math.floor(score / 5);
        clearInterval(gameInterval);
        gameInterval = setInterval(update, 1000 / newSpeed);
    }

// 计分系统
function updateScoreBoard() {

        currentScore.value.textContent = score;
        currentScore.value.classList.toggle('highlight', score > Math.max(...highScores));

        highScoresList.value.innerHTML = highScores
            .sort((a, b) => b - a)
            .slice(0, 5)
            .map((s, i) =>
                `<ol class="${s === score ? 'current-highlight' : ''}">Rank ${i+1}: ${s}</ol>`
            ).join('');
    }

function saveScore() {
        if (score > 0 && (highScores.length < 5 || score >= Math.min(...highScores))) {
            highScores.push(score);
            highScores = highScores.sort((a, b) => b - a).slice(0, 5);
            localStorage.setItem('snakeHighScores', JSON.stringify(highScores));
        }
    }

// 碰撞检测
function checkBoundaryCollision() {
        if (!shieldActive && (
            snakeX < 0 ||
            snakeX >= total_col * blockSize ||
            snakeY < 0 ||
            snakeY >= total_row * blockSize
        )) {
            endGame();
        }
    }

function checkSelfCollision() {
        if (!shieldActive && snakeBody.some(
            segment => segment[0] === snakeX && segment[1] === snakeY
        )) {
            endGame();
        }
    }

function endGame() {
        gameOver = true;
        clearInterval(gameInterval);
        saveScore();
        showGameOver();
    }

function showGameOver() {
        finalScore.value.textContent = score;
        gameOverModal.value.style.display = 'block';
        updateScoreBoard();
    }

// 移动控制系统
function changeDirection(e) {
        if (isPaused) return;

        const keyActions = {
            'KeyW': () => speedY !== 1 && (speedX = 0, speedY = -1),
            'KeyS': () => speedY !== -1 && (speedX = 0, speedY = 1),
            'KeyA': () => speedX !== 1 && (speedX = -1, speedY = 0),
            'KeyD': () => speedX !== -1 && (speedX = 1, speedY = 0)
        };


        keyActions[e.code]?.();
    }


// 蛇身更新逻辑
function updateSnakeBody() {
        for (let i = snakeBody.length - 1; i > 0; i--) {
            snakeBody[i] = [...snakeBody[i - 1]];
        }
        if (snakeBody.length) {
            snakeBody[0] = [snakeX, snakeY];
        }
        snakeX += speedX * blockSize;
        snakeY += speedY * blockSize;
    }
</script>
<style scoped>
/* 全局基础设置 */
body {
    margin: 0;
    font-family: 'Comic Neue', 'Comic Sans MS', cursive;
    color: #6a1b9a;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    padding: 1rem;
    cursor: none !important;
}

h1 {
    font-size: 2.5rem;
    color: #ab47bc;
    text-shadow: 2px 2px #ffffffaa;
    margin-bottom: 2rem;
    text-align: center;
}

.geeks {
    font-size: 3rem;
    color: #f06292;
    display: inline-block;
    /* transform: rotate(-5deg); */
}

.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  /* background: linear-gradient(to right, #fce4ec, #e3f2fd); */
}

.game-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  width: 100%;
  max-width: 1200px;
  margin-top: 20px;
}

canvas {
  background-color: #f8bbd0;
  border: 4px dashed #81d4fa;
  border-radius: 1rem;
  box-shadow: 0 0 15px #ba68c8;
}

.control-panel {
  background-color: #f3e5f5;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 0 10px #ce93d8;
  min-width: 280px;
}



.score-board {
    width: 100%;
    margin-bottom: 1rem;
}

.score-board h3 {
    margin-top: 0;
    text-align: center;
    color: #7e57c2;
}

#high-scores {
    padding-left: 1.5rem;
    color: #4a148c;
}

.current-score {
    font-size: 1.2rem;
    font-weight: bold;
    text-align: center;
    color: #d81b60;
}

/* 高亮当前得分 */
.current-highlight {
    background-color: #ffecb3;
    border-radius: 0.5rem;
    padding: 0.2rem 0.5rem;
    color: #f57c00;
}

/* 控制按钮样式 */
.controls {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
}

button {
    background-color: #ba68c8;
    border: none;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 1rem;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

button:hover {
    background-color: #9575cd;
    cursor: none !important;
}

/* 弹窗样式 */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 204, 229, 0.8);
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.modal-content {
    background-color: #fff3e0;
    padding: 2rem;
    border-radius: 1rem;
    text-align: center;
    box-shadow: 0 0 15px #ffb74d;
}

.modal-content h2 {
    color: #ec407a;
}

.modal-content button {
    margin-top: 1rem;
    background-color: #f48fb1;
}
</style>