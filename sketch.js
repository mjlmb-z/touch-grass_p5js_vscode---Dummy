let img = [];
let mySarg;
let currentFrame = 0;
let gameStarted = false; // Start screen state
let particles = []; 

let idleTimer = 0;       // counts frames since last touch
let idleTimeout = 450;   // 100 is 1.6sec; 300 is 5seconds [BEST 660 imo, 11sec] CHANGE HERE FOR THE TIME-OUT ;; last-change:300
let returning = true;   

let firstTouch = true;
let dialogueStartFrame = 0;

let gameOverActive = false;
let gameOverTimer = 0;
let gameOverAlpha = 0;

let click;
let endSound;

//NON-CLICKABLE ZONE              
let promptTimer = 0;
let promptX = 0;
let promptY = 0;

let scaleFactor = 1;
let textScale = 1;


function preload() {
  for (let i = 0; i < 31; i++) {
    img[i] = loadImage("images/" + (i + 1) + ".png");
  }

  font = loadFont("fonts/FakeReceipt.otf")
  sub_font = loadFont("fonts/Helvetica.ttf");

  click = loadSound('assets/softpop.mp3');
  endSound = loadSound('assets/softpop.mp3');
}

class sarg {
  constructor(m, n, x, y) {
    this.m = m;
    this.n = n;
    this.x = x;
    this.y = y;
  }

  display() {
    if (img[currentFrame] && img[currentFrame].width > 0) {
      image(img[currentFrame], this.x, this.y, this.m, this.n);
    }
  }

  contains(mx, my) {
    return (
      mx > this.x && mx < this.x + this.m && my > this.y && my < this.y + this.n
    );
  }

  clicked() {
    currentFrame = (currentFrame + 1) % img.length;
  }
}

// Snow particle 
class Particle {
  constructor() {
    this.x = random(width);
    this.y = random(-500, 0);
    this.size = random(2, 6);
    this.speed = random(0.7, 1.3);
  }

  update() {
    this.y += this.speed;
    if (this.y > height) {
      this.y = random(-50, 0);
      this.x = random(width);
    }
  }

  show() {  
    fill(0, 255, random(200), random(250));
    // stroke(0, 255, random(200), random(250));
    // strokeWeight(random(1,3);)
    noStroke();
    ellipse(this.x, this.y, this.size);
  }
}

async function setup() {
  createCanvas(windowWidth, windowHeight);

  click.setVolume(0.075);
  //endSound.setVolume(0.8);

  for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
  }

  updateSargLayout();

  // if(windowWidth > 350){
  // //widh of the MC (200, 400); 0.5 of width, ht - ht of MC
  //   mySarg = new sarg(400, 800, width / 2 - 200, (height - 800) * 0.6);
  // } 
  // else{

  //   let scale = min(width / 390, height / 844);    
  //   let w = 400 * scale;                            
  //   let h = 800 * scale;                           
  //   let x = (width - w) / 2;                       
  //   let y = (height - h) * 0.6;                     

  //   mySarg = new sarg(w, h, x, y);   
    
  // }
  
}

let fadeAlpha = 0; // for main image
let dialogueTimer = 0; // counts frames for display
let dialogueAlpha = 0;
let dialogueTarget = 255;  // target alpha when fully visible
let dialogueShown = false; //ensures that iit happens only once

let startScreenTimer = 0;

function draw() {

  background("#1c1c1c");
  // stroke("yellow");
  // strokeWeight(2); //INDICATOR OF THE CANVAS
  noFill();
  rect(0, 0, width, height);
  updateParticles();

  //idleTimer++;

  let startDelayFrames = 0;  // 1 second (60fps)
  if (!gameStarted && frameCount < startDelayFrames) {
    return; 
  }


  // START SCREEN
  if (!gameStarted) {

    //cursor(HAND);

    startScreenTimer++; 

    if (startScreenTimer < 60) return;  

    textFont(font);
    textAlign(CENTER, CENTER);
    fill(250, 255, 230, 222);
    textSize(27);
    text("Touch to begin", width / 2, height * 0.72);
    if (frameCount % 60 < 30) return;  
    return;
  }

  // KEEP TOUCHING PROMPT         
  let d = frameCount - dialogueStartFrame;

  if (!dialogueShown && d < 290) {

    if(d<30) return;

    let a = 0;

    if (d < 60) a = map(d, 80, 120, 0, 255);
    else if (d < 120) a = 255;
    else a = map(d, 100, 240, 255, 0);

    textFont(font);
    textAlign(LEFT,CENTER);
    fill(20, 255, 200, a);
    textSize(24 * textScale);
    text("Hello, I'm Sarg", (width * 0.5) + (width*0.11) , height * 0.67);
    
    // sub dialogue (keep tapping)
    if(d > 84 && d < 287)
      {
        let keepTapAlpha = 0;
        keepTapAlpha=map(d, 84, 275, 0, 250);
        keepTapAlpha=constrain(keepTapAlpha,0,180);

        textFont(sub_font);
        textAlign(LEFT,CENTER);
        fill(255, 250, 255, keepTapAlpha);
        textSize(22 * textScale);
        text("keep tapping", (width * 0.5) + (width*0.11), height * 0.70);
      }

    if (d >= 289) dialogueShown = true;
  }

  // GAME OVER MONOLOGUE
  if (gameOverActive) {

    cursor(ARROW);
    gameOverTimer++;
    
    let block1Alpha = 0;
    let block2Alpha = 0;
    
    // BLOCK 1 only: frames 30-200
    if (gameOverTimer >= 30 && gameOverTimer <= 200) {
      if (gameOverTimer <= 60) {
        block1Alpha = (gameOverTimer - 30) * 12.5;  // Fade IN
      } else {
        block1Alpha = 240;  // Hold
      }
    }
    /* CHNG HERE FOR THE GGO */
    // FORCE Block 1 OFF during Block 2 (frames 230-420)
    else if (gameOverTimer >= 200) {
      block1Alpha = 0;
    }

    // BLOCK 2 only: frames 270-780
    if (gameOverTimer >= 200 && gameOverTimer <= 630) {
      if (gameOverTimer <= 230) {
        block2Alpha = (gameOverTimer - 230) * 12.5;  // Fade IN
      } else {
        block2Alpha = 240;  // for the Hold;;
      }
    }
    
    // FADE BOTH OUT: frames 240-300
    if (gameOverTimer >= 630 && gameOverTimer <= 720) {
      let fadeProgress = (gameOverTimer - 420) * 12.5;
      block1Alpha = max(0, 255 - fadeProgress);
      block2Alpha = max(0, 255 - fadeProgress);
    }
    
    if (gameOverTimer > 720) //CHANGE HERE, TIMEOUT TIME TO START (840 def)
    {
      gameOverActive = false;
      gameStarted = false;
      startScreenTimer = 0;
      gameOverTimer = 0;
    }
    
    //Draw 
    textFont(font);
    textAlign(CENTER, CENTER);
    fill(255, 255, 255, block1Alpha);
    textSize(24);
    text("I am a digital grass.\nI fail when overused.", width/2, height*0.63);
    
    fill(255, 255, 255, block2Alpha);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Real grass doesn't.\nTouch that instead.", width/2, height*0.63);
  
    return;  
  }

  // IMAGE SCREEN (gameStarted === true)
  idleTimer++;

  // fade in first
  if (idleTimer <= 10) {
    fadeAlpha = min(fadeAlpha + 20, 255);
  }
  // fade out after timeout
  else if(idleTimer > idleTimeout) {
    fadeAlpha -= 4;
    fadeAlpha = max(fadeAlpha, 0);

    if (fadeAlpha === 0) {
      gameStarted = false;
      returning = true;
      idleTimer = 0; 
      startScreenTimer = 0;
      dialogueTimer = 0;
      dialogueShown = false;
      return;
    }
  }
  push();
  tint(255, fadeAlpha);
  mySarg.display();
  pop();

  if(mySarg.contains(mouseX, mouseY)){
    cursor(HAND);
  }else{
    cursor(ARROW);
  }

  if (promptTimer > 0){
    let a = map(promptTimer, 0, 60, 0, 200);
    textFont(sub_font);
    textAlign(LEFT, LEFT);
    fill(255, 0, 0, a);
    textSize(20 * scaleFactor);
    text("kindly tap on\nthe grass x)", promptX, promptY);
    promptTimer--;
  }

}


function updateParticles() {
  for (let p of particles) {
    p.update();
    p.show();
  }
}

function touchStarted() {

  userStartAudio();

  if (gameOverActive){
    return false;
  }

  idleTimer = 0;

  if (!gameStarted) {
    gameStarted = true;
    fadeAlpha = 0;
    currentFrame = 0;

    dialogueStartFrame = frameCount; 
    dialogueShown = false;

    if(click && click.isLoaded()) click.play();

    return false;
  }

  if (mySarg.contains(mouseX, mouseY)) {

    let oldFrame = currentFrame;
    if (oldFrame === img.length - 1) { 
      gameOverActive = true;
      gameOverTimer = 0;
      currentFrame = img.length - 1; 
      if (endSound && endSound.isLoaded()) endSound.play();
    } else {
      mySarg.clicked(); 
      if (click && click.isLoaded()) click.play();
    } 
  } else{

    promptTimer = 60;
    promptX = mouseX;
    promptY = mouseY + 36;
  }

  return false;
}


function touchPressed() {
  touchStarted(); 
  return false;
}

function updateSargLayout(){

  if (width < 430) {
    scaleFactor = map(width, 320, 430, 0.55, 0.9);
  } 
  else if (width < 760) {
    scaleFactor = map(width, 430, 1024, 0.85, 1.1);
  } 
  else {
    scaleFactor = 1;
  }

  scaleFactor = constrain(scaleFactor, 0.55, 1);
  textScale = scaleFactor * 0.67;

  let w = 400 * scaleFactor;
  let h = 800 * scaleFactor;
  //let x = (width - w) / 2 - (w/2);
  let x = floor((width-w) / 2);
  let y = (height - h) * 0.6;

  mySarg = new sarg(w, h, x, y);

}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  updateSargLayout();
  console.log('scaleFactor');
}