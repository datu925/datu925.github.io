  var canvas = document.getElementById("myCanvas");
  var ctx = canvas.getContext("2d");

  var ball = {
    "x": canvas.width/2,
    "y": canvas.height/2,
    "dx": 2,
    "dy": -2,
    "radius": 10
  };

  var paddle = {
    "height": 75,
    "width": 10,
    "upPressed": false,
    "downPressed": false
  }
  paddle["y"] = (canvas.height-paddle.height)/2;

  var AI = {
    "height": 75,
    "width": 10,
    "upPressed": false,
    "downPressed": false
  }
  AI["y"] = (canvas.height-AI.height)/2;

  var metadata = {
    "score": 0,
  }
  var center_line_width = 10;
  var session_high_score;

  function drawBall() {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
      ctx.fillStyle = "#0095DD";
      ctx.fill();
      ctx.closePath();
  }

  function drawPaddle() {
    ctx.beginPath();
    ctx.rect(0, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
  }

  function drawAI() {
    ctx.beginPath();
    ctx.rect(canvas.width - AI.width, AI.y, AI.width, AI.height);
    ctx.fillStyle = "#AA3939";
    ctx.fill();
    ctx.closePath();
  }

  function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: "+metadata.score, 8, 20);
  }

  function drawBoard() {
    ctx.beginPath();
    ctx.rect((canvas.width - center_line_width)/2,0,center_line_width,canvas.height);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.closePath();
  }


  function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBoard();
      drawBall();
      drawPaddle();
      drawAI();
      drawScore();

      if(ball.y + ball.dy > canvas.height || ball.y + ball.dy < 0) {
        ball.dy = -ball.dy;
      }
      if(ball.x + ball.dx > canvas.width-ball.radius) {
        if (ball.y > AI.y && ball.y < AI.y + AI.height)
          ball.dx = -ball.dx;
        else {
          alert("You win! But this is not possible with current AI.");
          document.location.reload();
        }
      } else if(ball.x + ball.dx < ball.radius)
      {
          if(ball.y > paddle.y && ball.y < paddle.y + paddle.height) {
              metadata.score += 1;
              ball.dx = -ball.dx;
              ball.dx *= 1.05;
              ball.dy *= 1.05;
          }
          else {
            gameEnd();
          }
      }

      if(paddle.upPressed && paddle.y < canvas.height-paddle.height) {
          paddle.y += 7;
      }
      else if(paddle.downPressed && paddle.y > 0) {
          paddle.y -= 7;
      }

      ball.x += ball.dx;
      ball.y += ball.dy;

      AI.y += ball.dy;
  }

  function gameEnd() {
    if (!sessionStorage.getItem("session_high_score")) {
      session_high_score = metadata.score;
      sessionStorage.setItem("session_high_score", session_high_score);
    } else {
      session_high_score = sessionStorage.getItem("session_high_score");
    }

    if (metadata.score >= session_high_score) {
      session_high_score = metadata.score;
      sessionStorage.setItem("session_high_score", session_high_score);
      alert("HIGH SCORE!!\nGAME OVER\nFinal Score: "+metadata.score);
      document.location.reload();
    } else {
      alert("GAME OVER\nFinal Score: "+metadata.score+
        "\nHigh Score: "+session_high_score);
      document.location.reload();
    }
  }

  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);

  function keyDownHandler(e) {
    if(e.keyCode == 40) {
        paddle.upPressed = true;
    }
    else if(e.keyCode == 38) {
        paddle.downPressed = true;
    }
  }

  function keyUpHandler(e) {
    if(e.keyCode == 40) {
        paddle.upPressed = false;
    }
    else if(e.keyCode == 38) {
        paddle.downPressed = false;
    }
  }

  setInterval(draw, 10);