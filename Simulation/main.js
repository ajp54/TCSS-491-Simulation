
// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Circle(game) {
    this.player = 1;
    this.startRadius = 20;
    this.radius = 20;
    this.visualRadius = 500;
    this.colors = ["Red", "Green", "Blue", "White"];
    this.color = "rgb(255, 255, 255)";
    this.foodEaten = 0;
    this.secondsUntilStarve = 10;
    this.reproduceCount = 1;
    this.setPrey();
    Entity.call(this, game, this.radius + Math.random() * (1200 - this.radius * 2), this.radius + Math.random() * (700 - this.radius * 2));

    this.velocity = { x: Math.random() * 500, y: Math.random() * 500 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (this.speed > this.maxSpeed) {
        var ratio = this.maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.setPreditor = function () {
    this.preditor = true;
    this.prey = false;
    this.food = false;
    this.class = 0;
    this.visualRadius = 500;
    this.color = "rgb(255, 0, 0)";
    this.speed = 100
    this.maxSpeed = 210;
    this.reproduceCount = 2;
};

Circle.prototype.setPrey = function () {
    this.preditor = false;
    this.prey = true;
    this.food = false;
    this.class = 3;
    this.visualRadius = 200;
    this.color = "rgb(255, 255, 255)";
    this.speed = 80
    this.maxSpeed = 200;
    this.reproduceCount = 1;
};

Circle.prototype.setFood = function () {
    this.preditor = false;
    this.prey = false;
    this.food = true;
    this.class = 1;
    this.visualRadius = 200;
    this.speed = 0;
    this.color = "rgb(0, 255, 0)";
};

Circle.prototype.slow = function (slowAmount) {
    this.visualRadius += growAmount;
    this.speed -= slowAmount;
    if(speed < 0)
        this.speed = 1;
}

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > this.game.ctx.canvas.width;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > this.game.ctx.canvas.height;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
 //  console.log(this.velocity);


 // plants should never move
    if (this.class === 1) {
        this.velocity.x = 0;
        this.velocity.y = 0;
    }

    // spawn new prey when one of the prey have eaten enough
    if (this.class === 3 && this.foodEaten >= 2) {
        circle = new Circle(this.game);

        //chance that cell mutates into a preditor
        var rand = Math.floor(Math.random() * 100);
        //console.log("random number:" + rand);
        if (rand < 7) {
            circle.setPreditor();
        } else {
            circle.setPrey();
            rand = Math.floor(Math.random() * 100);
            if (rand < 15){
                circle.mutate();
                // console.log("MUTATION");
            } else {
                circle.copyAttributes(this);
            }
            
        }
        this.game.addEntity(circle);
        circle.pickSpawn(this);
        this.foodEaten -= 2;
        //console.log("added prey");
    }
    if (this.class === 0) {
        if (this.secondsUntilStarve <= 0) {
            this.removeFromWorld = true;
        }
        // spawn new prepreditor when one of the preditors have eaten enough
        if (this.foodEaten >= 4) {
            circle = new Circle(this.game);
            circle.pickSpawn(this);
            circle.setPreditor();
            this.game.addEntity(circle);
            this.foodEaten -= 3;
            //this.secondsUntilStarve = 7
            //this.radius += 10;
            this.speed -= 15;
            // console.log("added preditor");
        }
    }

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = this.game.ctx.canvas.width - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = this.game.ctx.canvas.height - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            if (ent.class !== 1 && this.class !== 1){
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;

            if(this.class == ent.class){
                this.x += difX * delta / 2;
                this.y += difY * delta / 2;
                ent.x -= difX * delta / 2;
                ent.y -= difY * delta / 2;
            }

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;
            }

            if (this.preditor && ent.prey) {
                ent.removeFromWorld = true;
                this.foodEaten++;
                this.secondsUntilStarve += 2;
                //console.log("food eaten: " +  this.foodEaten);
            }
            else if (ent.preditor && this.prey) {
                this.removeFromWorld = true;
                ent.foodEaten++;
                ent.secondsUntilStarve += 2;
                //console.log("food eaten: " +  ent.foodEaten);
            }
            if (this.prey && ent.food) {
                ent.removeFromWorld = true;
                this.foodEaten++;
                //console.log("food eaten: " +  this.foodEaten);
            }
            else if (ent.prey && this.food) {
                this.removeFromWorld = true;
                ent.foodEaten++;
                //console.log("food eaten: " +  ent.foodEaten);
            }
        }

        //make preditors search for prey and prey flee from preditors
        if (ent != this && ent.class !== 1 && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (this.preditor && dist > this.radius + ent.radius + 10) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > this.maxSpeed) {
                    var ratio = this.maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if (ent.preditor && dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > this.maxSpeed) {
                    var ratio = this.maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
        }

        //make prey search for plants
        if (ent != this && ent.class === 1 && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (this.prey && dist > this.radius + ent.radius + 10) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > this.maxSpeed) {
                    var ratio = this.maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            // if (ent.preditor && dist > this.radius + ent.radius) {
            //     var difX = (ent.x - this.x) / dist;
            //     var difY = (ent.y - this.y) / dist;
            //     this.velocity.x -= difX * acceleration / (dist * dist);
            //     this.velocity.y -= difY * acceleration / (dist * dist);
            //     var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            //     if (speed > maxSpeed) {
            //         var ratio = maxSpeed / speed;
            //         this.velocity.x *= ratio;
            //         this.velocity.y *= ratio;
            //     }
            // }
        }
    }


    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Circle.prototype.getHungry = function () {
    this.secondsUntilStarve--;
}

Circle.prototype.pickSpawn = function (parent) {
    let safeDist = 2 * this.radius + parent.radius;
    if (parent.x + safeDist < this.game.ctx.canvas.width)
        this.x = parent.x + safeDist;
    else 
    this.x = parent.x - safeDist;

    if (parent.y + safeDist < this.game.ctx.canvas.height)
    this.y = parent.y + safeDist;
    else 
    this.y = parent.y - safeDist;    
}

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};

Circle.prototype.mutate = function () {
    this.radius += posOrNeg() * this.radius/2 * Math.random();
    if (this.radius < 10) {
        this.radius = 10;
    }
    // this.radius = this.startRadius;
    this.visualRadius += posOrNeg() * this.visualRadius/2 * Math.random();
    if (this.visualRadius < 1) {
        this.visualRadius = 1;
    }
    this.maxSpeed += posOrNeg() * this.maxSpeed/2 * Math.random();
    if (this.maxSpeed < 5) {
        this.maxSpeed = 5;
    }
    var newColor = 220 * Math.random() + 20;
    switch (this.class) {
        case 0: 
        this.color = "rgb(" + newColor + ", 0, 0)";
        break;
        case 1: 
        this.color = "rgb(0, " + newColor + ", 0)";
        break;
        case 3: 
        var newColor2 = 220 * Math.random() + 20;
    var newColor3 = 220 * Math.random() + 20;
        this.color = "rgb(" + newColor + ", " + newColor2 + ", " + newColor3 + ")";
        break;
    }

    if (Math.random * 100 < 50) {
        this.reproduceCount += posOrNeg();
        if(this.reproduceCount <= 0) {
            this.reproduceCount = 1;
        }
    }
    
}

Circle.prototype.copyAttributes = function (circle) {
    this.radius = circle.radius;
    this.visualRadius = circle.visualRadius;
    this.speed = circle.speed;
    this.color = circle.color;
}

let posOrNeg = function () {
    var a = Math.floor(1.99999 * Math.random());
    if (a == 0)
        return -1;
    else 
        return 1;

}

// Assignment 3 code
let captureState = function (game) {
    for(let i = 0; i < game.entities.length; i++) {
        let circle = game.entities[i];
        var vX = circle.velocity.x;
        var vY = circle.velocity.y;
        game.entityData.push({
            x: circle.x,
            y: circle.y,
            player: circle.player,
            startRadius: circle.startRadius,
            radius: circle.radius,
            visualRadius: circle.visualRadius,
            color: circle.color,
            foodEaten: circle.foodEaten,
            secondsUntilStarve: circle.secondsUntilStarve,
            reproduceCount: circle.reproduceCount,
            class: circle.class,
            preditor: circle.preditor,
            prey: circle.prey,
            food: circle.food,
            speed: circle.speed,
            maxSpeed: circle.maxSpeed,
            velocityX: vX,
            velocityY: vY
        })
    }
}

let loadState = function (game, data) {
    // first clear all entities from the game engine
    for(let i = 0; i < game.entities.length; i++) {
        game.entities[i].removeFromWorld = true;
    }

    
    for(let i = 0; i < data.length; i++) {
        let circle = new Circle(game);
        let element = data[i];

        circle.x = element.x;
        circle.y = element.y;
        circle.player = element.player;
        circle.startRadius = element.startRadius;
        circle.radius = element.radius;
        circle.visualRadius = element.visualRadius;
        circle.color = element.color;
        circle.foodEaten = element.foodEaten
        circle.secondsUntilStarve = element.secondsUntilStarve;
        circle.reproduceCount = element.reproduceCount;
        circle.class = element.class;
        circle.preditor = element.preditor;
        circle.prey = element.prey;
        circle.food = element.food;
        circle.speed,
        circle.speed = element.speed;
        circle.maxSpeed = element.maxSpeed;
        circle.velocity.x = element.velocityX;
        circle.velocity.x = element.velocityY;
        
        game.addEntity(circle);
    }
    console.log("finished loading scene");
}


  

// the "main" code begins here
var friction = 1;
var acceleration = 500000;
//var maxSpeed = 200;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');


    var gameEngine = new GameEngine();
    for(let i = 0; i < 2; i++) {
    var circle = new Circle(gameEngine);
    circle.setPreditor();
    gameEngine.addEntity(circle);
    }
    for (var i = 0; i < 12; i++) {
        circle = new Circle(gameEngine);
        gameEngine.addEntity(circle);
    }
    gameEngine.init(ctx);
    gameEngine.start();
    window.setInterval(function() {
        circle = new Circle(gameEngine);
        var rand = Math.floor(Math.random() * 100);
        // console.log("random number:" + rand);
        if (rand < 10) {
            circle.setPrey();
        } else {
            circle.setFood();
        }
        gameEngine.addEntity(circle);
    }, 500);

    window.setInterval(function() {
        for (let i = 0; i < gameEngine.entities.length; i++) {
            gameEngine.entities[i].getHungry();
            // console.log("timeUntilStarve = " + gameEngine.entities[i].sencondsUntilStarve);
        }
        circle.setFood();
        gameEngine.addEntity(circle);
    }, 1000);


    window.onload = function () {
        var socket = io.connect("http://24.16.255.56:8888");
      
        socket.on("load", function (message) {
            gameEngine.entityData = message.data;
            loadState(gameEngine, message.data);
        });
      
        var saveButton = document.getElementById("save");
        var loadButton = document.getElementById("load");
      
        saveButton.onclick = function () {
          console.log("save");
          captureState(gameEngine);
          socket.emit("save", { studentname: "Anders Pedersen", statename: "aState", data: gameEngine.entityData });
        };
      
        loadButton.onclick = function () {
          console.log("load");
          socket.emit("load", { studentname: "Anders Pedersen", statename: "aState" });
        };
      
      };
    
});
