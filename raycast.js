const TILE_SIZE = 64;
const NUM_ROWS = 11;
const NUM_COLS = 15;

const WINDOW_WIDTH = NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);

const WALL_STRIP_WIDTH = 1;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

const MINIMAP_SCALE_FACTOR = 0.25;

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
  hasWallAt(x, y){
    if(x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT){
      return true;
    }
    let gridX = Math.floor(x / TILE_SIZE);
    let gridY = Math.floor(y / TILE_SIZE);
    let tile = this.grid[gridY][gridX];
    return tile != 0;
  }
  render(){
    for(let i = 0; i < NUM_ROWS; i++){
      for(let j = 0; j < NUM_COLS; j++){
        let x = j * TILE_SIZE;
        let y = i * TILE_SIZE;
        let color = this.grid[i][j] === 1 ? '#222' : '#fff';
        stroke('#222');
        fill(color);
        rect(
          MINIMAP_SCALE_FACTOR * x, 
          MINIMAP_SCALE_FACTOR * y, 
          MINIMAP_SCALE_FACTOR * TILE_SIZE, 
          MINIMAP_SCALE_FACTOR * TILE_SIZE
        );
      }
    }
  }
}

class Player {
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.radius = 4;
    this.turnDirection = 0;
    this.walkDirection = 0;
    this.rotationAngle = Math.PI / 2;
    this.moveSpeed = 4.0;
    this.rotationSpeed = 3 * (Math.PI / 180);
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
    circle(
      MINIMAP_SCALE_FACTOR * this.x, 
      MINIMAP_SCALE_FACTOR * this.y, 
      MINIMAP_SCALE_FACTOR * this.radius
    );
    stroke('red');
    line(
      MINIMAP_SCALE_FACTOR * this.x, 
      MINIMAP_SCALE_FACTOR * this.y, 
      MINIMAP_SCALE_FACTOR * (this.x + Math.cos(this.rotationAngle) * 20), 
      MINIMAP_SCALE_FACTOR * (this.y + Math.sin(this.rotationAngle) * 20)
    );
  }
}

class Ray {
  constructor(angle){
    this.angle = normalizeAngle(angle);
    this.wallHitX = 0;
    this.wallHitY = 0;
    this.distance = 0;
    this.isVertHit = false;

    this.isRayFacingDown = this.angle > 0 && this.angle < Math.PI;
    this.isRayFacingUp = !this.isRayFacingDown;

    this.isRayFacingRight = this.angle < 0.5 * Math.PI || this.angle > 1.5 * Math.PI;
    this.isRayFacingLeft = !this.isRayFacingRight;
  }
  cast(){
    let xintercept, yintercept;
    let xstep, ystep;
    const isInsideScreen = (x,y) => x >=0 && x <= WINDOW_WIDTH && y >=0 && y <= WINDOW_HEIGHT;

    //Horizontal intersaction
    
    let foundHorzWallHit = false;
    let horzWallHitX = 0;
    let horzWallHitY = 0;


    yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
    yintercept += this.isRayFacingDown ? TILE_SIZE : 0;


    xintercept = player.x + (yintercept - player.y) / Math.tan(this.angle);


    ystep = TILE_SIZE;
    ystep *= this.isRayFacingUp ? -1 : 1;

    xstep = TILE_SIZE / Math.tan(this.angle);
    xstep *= (this.isRayFacingLeft && xstep > 0) ? -1 : 1;
    xstep *= (this.isRayFacingRight && xstep < 0) ? -1 : 1;

    let nextHorzTouchX = xintercept;
    let nextHorzTouchY = yintercept;

    while(isInsideScreen(nextHorzTouchX, nextHorzTouchY)){
      if(level.hasWallAt(nextHorzTouchX, nextHorzTouchY - (this.isRayFacingUp ? 1 : 0))){
        foundHorzWallHit = true;
        horzWallHitX = nextHorzTouchX;
        horzWallHitY = nextHorzTouchY;
        break;
      }
      else{
        nextHorzTouchX += xstep;
        nextHorzTouchY += ystep;
      }
    }


    //Vertical intersaction
    let foundVertWallHit = false;
    let vertWallHitX = 0;
    let vertWallHitY = 0;


    xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
    xintercept += this.isRayFacingRight ? TILE_SIZE : 0;


    yintercept = player.y + (xintercept - player.x) * Math.tan(this.angle);


    xstep = TILE_SIZE;
    xstep *= this.isRayFacingLeft ? -1 : 1;

    ystep = TILE_SIZE * Math.tan(this.angle);
    ystep *= (this.isRayFacingUp && ystep > 0) ? -1 : 1;
    ystep *= (this.isRayFacingDown && ystep < 0) ? -1 : 1;

    let nextVertTouchX = xintercept;
    let nextVertTouchY = yintercept;

    while(isInsideScreen(nextVertTouchX, nextVertTouchY)){
      if(level.hasWallAt(nextVertTouchX - (this.isRayFacingLeft ? 1 : 0), nextVertTouchY)){
        foundVertWallHit = true;
        vertWallHitX = nextVertTouchX;
        vertWallHitY = nextVertTouchY;
        break;
      }
      else{
        nextVertTouchX += xstep;
        nextVertTouchY += ystep;
      }
    }


    let horzHitDistance = foundHorzWallHit ? distanceBetweenPoints(player.x, player.y, horzWallHitX, horzWallHitY) : Number.MAX_VALUE;
    let vertHitDistance = foundVertWallHit ? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY) : Number.MAX_VALUE;


    if(vertHitDistance < horzHitDistance){
      this.wallHitX = vertWallHitX;
      this.wallHitY = vertWallHitY;
      this.distance = vertHitDistance;
      this.isVertHit = true;
    }
    else
    {
      this.wallHitX = horzWallHitX;
      this.wallHitY = horzWallHitY;
      this.distance = horzHitDistance;
      this.isVertHit = false;
      
    }
  }
  render(){
    stroke('rgba(255, 255, 0, 1.0)');
    line(
      MINIMAP_SCALE_FACTOR * player.x, 
      MINIMAP_SCALE_FACTOR * player.y, 
      MINIMAP_SCALE_FACTOR * this.wallHitX, 
      MINIMAP_SCALE_FACTOR * this.wallHitY
    );
  }
}

var level = new Level();
var player = new Player(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2);
let rays = [];


function normalizeAngle(angle){
  angle = angle % (2 * Math.PI);
  if(angle < 0){
    angle = (2 * Math.PI) + angle;
  }
  return angle;
}

function distanceBetweenPoints(x1, y1, x2, y2){
  return Math.sqrt((x2-x1) * (x2-x1) + (y2-y1) * (y2-y1));
}

function render3DProjectedWalls(){
  for(let i=0; i < NUM_RAYS; i++){
    let ray = rays[i];
    //correct the fishbowl effect
    let correctWallDistance = ray.distance * Math.cos(ray.angle - player.rotationAngle);
    let distanceProjectionPlane = (WINDOW_WIDTH/2) / Math.tan(FOV_ANGLE/2);
    let wallStripHeight = (TILE_SIZE / correctWallDistance) * distanceProjectionPlane;
    
    let alpha = 1;//170 / correctWallDistance;
    let color = ray.isVertHit ? 255 : 180;
    fill(`rgba(${color},${color},${color},${alpha})`);
    noStroke();
    rect(
      i * WALL_STRIP_WIDTH,
      (WINDOW_HEIGHT/2) - (wallStripHeight / 2),
      WALL_STRIP_WIDTH,
      wallStripHeight
    );
  }
}

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

function castAllRays(){
  let rayAngle = player.rotationAngle - (FOV_ANGLE / 2);
  rays = [];
  for(let i=0; i < NUM_RAYS; i++){
    let ray = new Ray(rayAngle);
    ray.cast();
    rays.push(ray);
    rayAngle += FOV_ANGLE / NUM_RAYS;
  }
}

function setup(){
  createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update(){
  player.update();
  castAllRays();
}

function draw(){
  clear('#212121');
  update();
  render3DProjectedWalls();
  level.render();
  for(ray of rays){
    ray.render();
  }
  player.render();
}