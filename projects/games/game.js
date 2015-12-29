/*

I somehow lost the first draft of pseudocode which included an author's note,
so I'll be brief.

I chose to follow a web tutorial to get up and running with browswer games using
the canvas attribute. The tutorial was based on the classic game breakout, so to
show that I understood the code and was not plagiarizing, I adapted it to a game of
pong. The other major change, very much in keeping with the spirit of the challenge,
is that I object-ified the code; in the tutorial, it was very much just a collection
of variable states, but as you can see below, it revolves around ball and paddle
objects.

On further reflection, I could have gone even further with the object-ification and
embedded some of the draw methods in the objects, though that might have also gotten
more confusing.

You can play the actual game here:
http://datu925.github.io/projects/games/pong.html

Pseudocode (added after the fact, since my first draft got lost)

Start canvas.
Create ball object, which has a location, a radius, and a change in location
which we will use to describe its movement

Create paddle, which has a location (vertical only), dimensions, and whether
the current direction is up or down.

Create an AI paddle with the same properties as above.

Initialize score to zero.

Create functions to draw each of the above objects, based on their properties.

Create conditions to change the path of the ball or trigger certain game-ending events
based on the position of the ball; these happen by changing the dx and dy variables.

Create game ending scenarios based on when the ball would cross the left or right
side of the screen. Store information so that we can track high scores in a given
session.

Create the event listeners to figure out whether user is pressing the up or down
arrow keys, and translate that into the paddle states of moving up or down.

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