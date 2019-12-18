const TILE_SIZE = 32;
const NUM_ROWS = 11;
const NUM_COLS = 15;
const WINDOW_WIDTH = NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = NUM_ROWS * TILE_SIZE;

class Level {
  constructor(){
    this.grid = [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
      [1,1,0,0,0,1,1,1,1,1,1,1,1,0,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,0,0,0,1,1,0,1,1,0,0,1,1,1],
      [1,1,0,0,1,1,1,0,1,1,1,1,1,1,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];
  }
  render(){
    for(let i = 0; i < NUM_ROWS; i++){
      for(let j = 0; j < NUM_COLS; j++){
        let x = j * TILE_SIZE;
        let y = i * TILE_SIZE;
        let color = this.grid[i][j] === 1 ? '#222' : '#fff';
        stroke('#222');
        fill(color);
        rect(x, y, TILE_SIZE, TILE_SIZE);
      }
    }
  }
  hasWallAt(x,y){
    if(x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT){
      return true;
    }
    let gridX = Math.floor(x / TILE_SIZE);
    let gridY = Math.floor(y / TILE_SIZE);
    let tile = this.grid[gridY][gridX];
    return tile != 0;
  }
}

let level = new Level();

class Player {
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.radius = 3;
    this.turnDirection = 0;
    this.walkDirection = 0;
    this.rotationAngle = Math.PI / 2;
    this.moveSpeed = 2.0;
    this.rotationSpeed = 2 * (Math.PI / 180);
  }
  update(){
    this.rotationAngle += this.turnDirection * this.rotationSpeed;
    let moveStep = this.walkDirection * this.moveSpeed;
    let newX = this.x + Math.cos(this.rotationAngle) * moveStep;
    let newY = this.y + Math.sin(this.rotationAngle) * moveStep;
    if(!level.hasWallAt(newX, newY)){
      this.x = newX;
      this.y = newY;
    }
  }
  render(){
    noStroke();
    fill('red');
    circle(this.x, this.y, this.radius);
    stroke('red');
    line(this.x, this.y, this.x + Math.cos(this.rotationAngle) * 20, this.y + Math.sin(this.rotationAngle) * 20);
  }
}


let player = new Player(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2);

function keyPressed(){
  switch(keyCode){
    case UP_ARROW: 
      player.walkDirection = 1;
      break;
    case DOWN_ARROW: 
      player.walkDirection = -1;
      break;
    case RIGHT_ARROW: 
      player.turnDirection = 1;
      break;
    case LEFT_ARROW: 
      player.turnDirection = -1;
      break;
  }
}

function keyReleased(){
  switch(keyCode){
    case UP_ARROW: 
      player.walkDirection = 0;
      break;
    case DOWN_ARROW: 
      player.walkDirection = 0;
      break;
    case RIGHT_ARROW: 
      player.turnDirection = 0;
      break;
    case LEFT_ARROW: 
      player.turnDirection = 0;
      break;
  }
}

function setup(){
  createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update(){
  player.update();
}

function draw(){
  update();
  level.render();
  player.render();
}