// Global Variables
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var screenHeight = $(window).height();
var screenWidth = $(window).width();
var acceleration = 0;                       // acceleration in Y direction
var particles = {};                         //particles object which each particle gets added to
var particleIndex = 0;                      //Index counter for the particles
var surfaces = {};                          //Array for the shapes
var surfaceIndex = 0;                       //shapes index counter
var elasticResistance = -0.5;               //the number the velocity is multiplied by when particle collides
var surfaceResistance = 0.999;              
var spray = false;                          //If true particles spray out of mouse
var colorCounter = 0;
// Control Bar ---------------------
$('.minus').click(function(){
    console.log(acceleration)
    acceleration -= 0.01;
});
$('.plus').click(function(){
    console.log(acceleration)
    acceleration += 0.01;
});
// ----------------------------------

// Setting Canvas Dimensions
$(window).resize(function(){
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    canvas.width = screenWidth;
    canvas.height = screenHeight;
});
canvas.width = screenWidth;
canvas.height = screenHeight;
ctx.fillStyle = 'blue';


// setting up mouse and keyboard Events
var current = [], end = [], trigger;
$(document).mousedown(function(e){
    trigger = true;
    end = [e.pageX, e.pageY];
});
$(document).mousemove(function(e){
    current = [e.pageX, e.pageY];
});
$(document).mouseup(function(e){
    if (trigger){
        new surface(end,current);
    }
    trigger = false;
});
$(document).keypress(function(e){
    if(e.which == 32){
        if(spray){ 
            spray = false
            colorCounter = Math.floor(Math.random()*3);
        }
        else {spray = true}
    }
    if(e.which == 99){
        for(var i in surfaces){
            delete surfaces[i];
        }
    }
})

//Draws canvas box from position of two corners
function boxDraw(begin,end) {
    if (trigger) {
        ctx.beginPath();
        ctx.rect(begin[0], begin[1], end[0]-begin[0], end[1]-begin[1]);
        ctx.fillStyle = "#A1A1A1";
        ctx.fill();
    }
}
// Gets Random color
function getRandomColor() {
    var red = Math.floor(Math.random()*255).toString();
    var green = red;
    var blue = 10;
    var opacity = Math.random()*1
    if(colorCounter == 0){
        return 'rgba('+red+','+green+','+blue+','+opacity+')';
    }else if(colorCounter == 1){
        return 'rgba('+red+','+blue+','+green+','+opacity+')';
    }else if(colorCounter == 2){
        return 'rgba('+blue+','+red+','+green+','+opacity+')';
    }
   
}
// Creates a single particle
function particle(){
    this.Life = 0;
    this.Death = 150;
    this.Color = getRandomColor();
    this.Width = 4;
    this.Height = 2;
    this.Position = {
        X: current[0],
        Y: current[1]
    }
    this.Velocity = {
        X: Math.random()*7-3.5,
        Y: Math.random()*7-3.5
    }
    // Adds particle to particles object
    this.Id = particleIndex;
    particles[this.Id] = this;
    particleIndex++;

    //Calculating collions
    this.surfaceCollisions = function() {
        // Check collisions with edge of canvas update velocity
        function checkWallCollisions(a) {
            //Bottom,top, right, left walls respectivly
            if (a.Position.Y >= screenHeight-a.Height){
                a.Position.Y = screenHeight - a.Height;
                a.Velocity.Y *= elasticResistance;
                a.Velocity.X *= surfaceResistance;
            } 
            else if (a.Position.Y <= 0){
                a.Position.Y = 0;
                a.Velocity.Y *= elasticResistance;
                a.Velocity.X *= surfaceResistance;
            } else if (a.Position.X >= screenWidth-a.Width){
                a.Position.X = screenWidth-a.Width;
                a.Velocity.X *= elasticResistance;
                a.Velocity.Y *= surfaceResistance;
            } else if (a.Position.X <= 0){
                a.Position.X = 0;
                a.Velocity.X *= elasticResistance;
                a.Velocity.Y *= surfaceResistance;
            }
        }
        // Check is particle is within shape
        function checkShapeCollisions(a,b) {
            if (a.Position.Y <= b.Height + b.Position.Y && 
                a.Position.Y + a.Height >= b.Position.Y &&
                a.Position.X <= b.Width + b.Position.X &&
                a.Position.X + a.Width >= b.Position.X) {
                return true;
            }
        }
        // Iterate through shapes check which side collision happens updat velocity
        for(var i in surfaces){
            if (checkShapeCollisions(this,surfaces[i])){
                // Take particle out of shape
                do {
                    this.Position.X -= this.Velocity.X;
                    this.Position.Y -= this.Velocity.Y; 
                } while (checkShapeCollisions(this,surfaces[i]))
                //Check wether particle hit side and update X velocity
                if (this.Position.X <= surfaces[i].Position.X ||
                    this.Position.X >= surfaces[i].Position.X + surfaces[i].Width){
                    this.Velocity.X *= elasticResistance;
                //Check if perticle hit top or bottom update Y velocity
                } else if (this.Position.Y <= surfaces[i].Position.Y  ||
                    this.Position.Y >= surfaces[i].Position.Y + surfaces[i].Height){
                    this.Velocity.Y *= elasticResistance;
                }
            }
        }
        // checkWallCollisions(this);
    }
    // Calculating velocity and updating Position
    this.updatePosition = function() {
        if(this.Life >= this.Death){
            delete particles[this.Id];
        }
        else {
            this.Life += 1;
            this.Velocity.Y += acceleration;
            this.Position.Y += this.Velocity.Y;
            this.Position.X += this.Velocity.X;
        }
    }
    // Canvas Draw method
    this.draw = function() {
        ctx.beginPath();
        ctx.rect(this.Position.X, this.Position.Y, this.Width, this.Height);
        ctx.fillStyle = this.Color;
        ctx.fill();
    }
    // Runs through necissery functions
    this.update = function() {
        this.surfaceCollisions();
        this.updatePosition();
        this.draw();
    }
}
// Drawing shape
function surface(begin,end) {
    this.Width = end[0]-begin[0];
    this.Height = end[1]-begin[1];
    this.Color = "#ffffff";
    this.Position = {
        X: begin[0],
        Y: begin[1]
    };

    // Adds shape to shapes object
    this.Id = surfaceIndex;
    surfaces[this.Id] = this;
    surfaceIndex++;

    // Canvas draw code;
    this.draw = function() {
        ctx.beginPath();
        ctx.rect(this.Position.X, this.Position.Y, this.Width, this.Height);
        ctx.fillStyle = this.Color;
        ctx.fill();
    }
}

// Canvas loop
setInterval(function(){ 
  // clear canvas every frame
  // ctx.clearRect(0,0,screenWidth,screenHeight); //Delete line for cool effect

  if(spray){
    // number of particles added each frame
      for(var i = 0; i < 30; i++){
        new particle();
      }
  }
  // Draws ghost shape
  boxDraw(end,current);

  //Draws all shapes;
  for(var i in surfaces){
    surfaces[i].draw();
  }
  // Update all the partcles 
  for(var i in particles){
    particles[i].update();
  }
}, 1);


