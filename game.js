/*

Author's note: I decided to go a bit deeper in this challenge and try to build
a visual browser game using the canvas HTML attribute. To do that, I did use a
tutorial to get me started at:
https://developer.mozilla.org/en-US/docs/Games/Workflows/2D_Breakout_game_pure_JavaScript.
I used it primarily to get a sense of the syntax for playing around with the canvas
element. Then for my challenge, I adapted the tutorial (which is based on the classic
breakout game) into a game of pong. Right now, the AI will never lose (I think) but
future releases might incorporate more difficulty levels.

The other major change, which I think fits with the purpose of this solo-challenge,
is that I object-ified the code - whereas previously there were just a bunch of
variables, we now have objects and functions that modify them. So I hope it fits the
spirit of the challenge.

You can play the game here: http://datu925.github.io/projects/games/pong.html

Reflection

What was the most difficult part of this challenge?

I wanted to initialize a property in an object based on the values of previous
properties in the object, and it took me a while to figure out that you couldn't do
that (notice how I initialize the paddle and AI objects but then add one more property
afterward). JavaScript is permissive, so wasn't throwing a clear error to me; it just
wasn't rendering the game.

What did you learn about creating objects and functions that interact with one another?

It's really fun. I actually felt it was a lot easier to understand how to program the
AI after programming the initial, user-controlled panel. And object-oriented
programming is easier to read and avoids lots of convoluted variable names. For
instance, you can just have ball.location and paddle.location instead of
ball_location and paddle_location.

Did you learn about any new built-in methods you could use in your refactored solution? If so, what were they and how do they work?

I learned about sessionStorage and localStorage (specifically, the methods getItem
and setItem) and how you can store information even after the browser window is
refreshed or the browser is closed. It feels a little presumptuous to do the latter
without telling your user! But very useful in many contexts.

How can you access and manipulate properties of objects?

Through either bracket ([]) or dot (.) notation.

*/

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