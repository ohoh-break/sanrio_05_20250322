/* game.js */
(function() {
  "use strict";

  // 전역 변수 (또는 모듈 스코프 변수)
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  
  const gameOverText = document.getElementById("gameOverText");
  const scoreText = document.getElementById("scoreText");

  // 화면 크기
  let SCREEN_WIDTH = window.innerWidth;
  let SCREEN_HEIGHT = window.innerHeight;
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;

  // 바닥 설정
  const FLOOR_HEIGHT = 80;
  let FLOOR_TOP = SCREEN_HEIGHT - FLOOR_HEIGHT;

  // 시나몬롤 캐릭터
  const cinnamorollImg = new Image();
  cinnamorollImg.src = "cinnamoroll.png";
  let cinnamorollWidth = 64;
  let cinnamorollHeight = 64;
  let cinnamorollX = 50;
  let cinnamorollY = FLOOR_TOP - cinnamorollHeight;

  // 점프 관련
  let isJumping = false;
  let jumpPower = 15; 
  let gravity = 0.8;
  let velocityY = 0;

  // 점수
  let score = 0;

  // 버섯(장애물)
  const mushroomImg = new Image();
  mushroomImg.src = "mushroom.png";
  let mushroomWidth = 32;
  let mushroomHeight = 32;
  let mushroomSpeed = 6;
  // 버섯 스폰 타이머
  let spawnTimer = 0;
  let nextSpawnInterval = 90; // 일단 기본값 (랜덤화 가능)
  const minSpawnInterval = 60; 
  const maxSpawnInterval = 120;
  let mushrooms = [];

  // 구름(단순 장식)
  let clouds = [];
  let cloudTimer = 0;
  let cloudSpawnInterval = 120;

  // 게임 상태
  let gameOver = false;

  // =====================
  // 메인 게임 루프 함수
  // =====================
  function gameLoop() {
    if (!gameOver) {
      update();
      draw();
      requestAnimationFrame(gameLoop);
    } else {
      // 게임 오버 시 표시
      gameOverText.style.display = "block";
    }
  }

  // =============
  // 업데이트 로직
  // =============
  function update() {
    // 점프 처리
    if (isJumping) {
      cinnamorollY += velocityY;
      velocityY += gravity;
      // 바닥 충돌
      if (cinnamorollY >= FLOOR_TOP - cinnamorollHeight) {
        cinnamorollY = FLOOR_TOP - cinnamorollHeight;
        isJumping = false;
      }
    }

    // 버섯 스폰 (랜덤 간격)
    spawnTimer++;
    if (spawnTimer >= nextSpawnInterval) {
      spawnTimer = 0;
      nextSpawnInterval = getRandomInt(minSpawnInterval, maxSpawnInterval);
      mushrooms.push({
        x: SCREEN_WIDTH,
        y: FLOOR_TOP - mushroomHeight
      });
    }

    // 버섯 이동 & 충돌
    for (let i = 0; i < mushrooms.length; i++) {
      mushrooms[i].x -= mushroomSpeed;
      if (checkCollision(
        cinnamorollX, cinnamorollY, cinnamorollWidth, cinnamorollHeight,
        mushrooms[i].x, mushrooms[i].y, mushroomWidth, mushroomHeight
      )) {
        gameOver = true;
      }
    }
    // 화면 밖 버섯 제거
    mushrooms = mushrooms.filter(m => m.x > -mushroomWidth);

    // 구름 스폰
    cloudTimer++;
    if (cloudTimer >= cloudSpawnInterval) {
      cloudTimer = 0;
      let cloudY = 20 + Math.random() * (SCREEN_HEIGHT / 3);
      let cloudSize = 20 + Math.random() * 30; 
      let cloudSpeed = 1 + Math.random() * 1.5;
      clouds.push({
        x: SCREEN_WIDTH,
        y: cloudY,
        size: cloudSize,
        speed: cloudSpeed
      });
    }
    // 구름 이동
    for (let i = 0; i < clouds.length; i++) {
      clouds[i].x -= clouds[i].speed;
    }
    clouds = clouds.filter(c => c.x > -200);
  }

  // =========
  // 그리기
  // =========
  function draw() {
    // 캔버스 지우기
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 갈색 바닥
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, FLOOR_TOP, SCREEN_WIDTH, FLOOR_HEIGHT);

    // 구름
    for (let i = 0; i < clouds.length; i++) {
      drawCloud(clouds[i]);
    }

    // 시나몬롤
    ctx.drawImage(cinnamorollImg, cinnamorollX, cinnamorollY, cinnamorollWidth, cinnamorollHeight);

    // 버섯
    for (let i = 0; i < mushrooms.length; i++) {
      let m = mushrooms[i];
      ctx.drawImage(mushroomImg, m.x, m.y, mushroomWidth, mushroomHeight);
    }
  }

  // =========================
  // 구름 그리기 (사실적인 모양)
  // =========================
  function drawCloud(cloudObj) {
    ctx.fillStyle = "#FFFFFF";
    let cx = cloudObj.x;
    let cy = cloudObj.y;
    let size = cloudObj.size;

    // 중앙
    ctx.beginPath();
    ctx.arc(cx, cy, size, 0, Math.PI * 2);
    ctx.fill();

    // 왼쪽
    ctx.beginPath();
    ctx.arc(cx - size * 0.6, cy + size * 0.4, size * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // 오른쪽
    ctx.beginPath();
    ctx.arc(cx + size * 0.6, cy + size * 0.4, size * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // 위쪽(작게)
    ctx.beginPath();
    ctx.arc(cx, cy - size * 0.4, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // =========================
  // 충돌 판정(사각형)
  // =========================
  function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return (
      x1 < x2 + w2 &&
      x1 + w1 > x2 &&
      y1 < y2 + h2 &&
      y1 + h1 > y2
    );
  }

  // =========================
  // 유틸: 랜덤 정수 반환
  // =========================
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // =========================
  // 점프 처리 (+점수 증가)
  // =========================
  function doJump() {
    isJumping = true;
    velocityY = -jumpPower;
    score++;  
    // 점수 표시
    scoreText.textContent = "점수: " + score;
  }

  // =========================
  // 이벤트 리스너
  // =========================
  document.addEventListener("keydown", function(e) {
    if (e.code === "Space" && !isJumping && !gameOver) {
      doJump();
    }
  });
  document.addEventListener("mousedown", function() {
    if (!isJumping && !gameOver) {
      doJump();
    }
  });
  document.addEventListener("touchstart", function() {
    if (!isJumping && !gameOver) {
      doJump();
    }
  });

  // =========================
  // 윈도우 리사이즈
  // =========================
  window.addEventListener("resize", onResize);

  function onResize() {
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;

    FLOOR_TOP = SCREEN_HEIGHT - FLOOR_HEIGHT;

    // 캐릭터가 바닥에 붙어 있도록 조정
    if (!isJumping) {
      cinnamorollY = FLOOR_TOP - cinnamorollHeight;
    }
  }

  // =========================
  // 게임 시작
  // =========================
  window.addEventListener("load", function() {
    // 이미지 준비가 오래 걸리면 onload 콜백을 각각 처리해도 되지만,
    // 여기서는 단순히 바로 실행
    gameLoop();
  });

})();
