let blockSize = 25;
let total_row = 17;
let total_col = 17;
let board;
let context;

let snakeX = blockSize * 5;
let snakeY = blockSize * 5;
let speedX = 0;
let speedY = 0;
let snakeBody = [];
let foodX;
let foodY;
let score = 0;
let gameOver = false;

// 高分存储系统
let highScores = JSON.parse(localStorage.getItem('snakeHighScores')) || [];
let gameInterval;
let isPaused = false;

// 特殊食物系统
let specialFood = null;
let shieldActive = false;
let baseSpeed = 10;

window.onload = function () {
    board = document.getElementById("board");
    board.height = total_row * blockSize;
    board.width = total_col * blockSize;
    context = board.getContext("2d");

    // 初始化界面
    document.getElementById('pause').textContent = 'Pause';
    updateScoreBoard();
    placeFood();
    
    // 事件监听
    document.addEventListener("keyup", changeDirection);
    setupControls();
    setupTouchControls();
    
    // 启动游戏循环
    gameInterval = setInterval(update, 1000 / baseSpeed);
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
            type: ['speed', 'double', 'shield'][Math.floor(Math.random()*3)]
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
            specialFood.x + blockSize/2,
            specialFood.y + blockSize/2,
            blockSize/2,
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
    switch(type) {
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
    document.getElementById('start').addEventListener('click', () => {
        if (!gameInterval) {
            gameInterval = setInterval(update, 1000/baseSpeed);
        }
        alert('🐍 贪吃蛇游戏规则说明：\n🎮 基本玩法——\n1. 移动控制\n🕹️ 键盘方向键：w a s d 控制蛇的移动方向\n📱 触屏用户：在游戏区域滑动即可控制方向\n⚠️ 禁止反向移动：不能直接180度调头（如向下移动时不能立即向上）\n2. 得分机制\n🟡 普通食物：+1分（黄色方块）\n🔵 加速食物：+2分（蓝色圆球）并提升移动速度15秒\n🟣 双倍食物：+2分（紫色圆球）使蛇身增长双倍长度\n🛡️ 护盾食物：+2分（金色圆球）获得5秒碰撞免疫\n成长系统\n每吃1个食物蛇身增长1节\n双倍食物可使蛇身额外多增长1节\n蛇身最大长度无上限\n⚠️ 失败条件\n碰撞边界：蛇头触碰游戏区域边缘（护盾激活时除外）\n自我吞噬：蛇头触碰自己身体（护盾激活时除外）\n紧急停止：点击暂停按钮可随时冻结游戏\n🏆 进阶系统\n①每获得5分速度提升1级\n②速度等级显示在计分板（最高20级）\n③游戏重启后恢复初始速度')
    });

    document.getElementById('pause').addEventListener('click', function() {
        isPaused = !isPaused;
        this.textContent = isPaused ? 'Continue' : 'Pause';
        updateScoreBoard();
    });

    document.getElementById('restart').addEventListener('click', resetGame);
    document.getElementById('play-again').addEventListener('click', resetGame);
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
    gameInterval = setInterval(update, 1000/baseSpeed);
    document.getElementById('game-over-modal').style.display = 'none';
}

// 难度系统
function adjustDifficulty() {
    const newSpeed = baseSpeed + Math.floor(score/5);
    clearInterval(gameInterval);
    gameInterval = setInterval(update, 1000/newSpeed);
}

// 计分系统
function updateScoreBoard() {
    
    const currentElement = document.getElementById('current');
    currentElement.textContent = score;
    currentElement.classList.toggle('highlight', score > Math.max(...highScores));

    const highScoresList = document.getElementById('high-scores');
    highScoresList.innerHTML = highScores
        .sort((a,b) => b-a)
        .slice(0,5)
        .map((s, i) => 
            `<li class="${s === score ? 'current-highlight' : ''}">${i+1}. ${s}</li>`
        ).join('');
}

function saveScore() {
    if (score > 0 && (highScores.length < 5 || score > Math.min(...highScores))) {
        highScores.push(score);
        highScores = highScores.sort((a,b) => b-a).slice(0,5);
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
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over-modal').style.display = 'block';
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

// 移动端触摸控制
function setupTouchControls() {
    const touchArea = document.getElementById('board');
    let touchStart = null;

    touchArea.addEventListener('touchstart', e => {
        e.preventDefault();
        touchStart = [e.touches[0].clientX, e.touches[0].clientY];
    });

    touchArea.addEventListener('touchmove', e => {
        e.preventDefault();
        if (!touchStart) return;

        const touchEnd = [e.touches[0].clientX, e.touches[0].clientY];
        const dx = touchEnd[0] - touchStart[0];
        const dy = touchEnd[1] - touchStart[1];
        
        if (Math.abs(dx) > Math.abs(dy)) {
            dx > 0 ? changeDirection({ code: 'ArrowRight' }) 
                   : changeDirection({ code: 'ArrowLeft' });
        } else {
            dy > 0 ? changeDirection({ code: 'ArrowDown' })
                   : changeDirection({ code: 'ArrowUp' });
        }
        touchStart = touchEnd;
    });
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