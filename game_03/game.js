
'use strict';

// Setup canvas
var canvas = document.createElement('canvas');
var ctx    = canvas.getContext('2d');

canvas.id     = 'canvas';
canvas.width  = 640;
canvas.height = 480;

document.getElementById('gameWrapper').appendChild(canvas);


// Background objects
var bg = {
	sky: {
		color: '#000000',
		render: function() {
			ctx.fillStyle = this.color;
			ctx.beginPath();
			ctx.rect(0, 0, canvas.width, canvas.height);
			ctx.closePath();
			ctx.fill();
		}
	},
	stars: {
		stars: [],
		color: '#ffffff',
		render: function() { // Render stars
			if(this.stars.length == 0) { // Populate this.stars
				var count = Math.floor((Math.random() * 1000) % 500); // Decide amount

				for(var i = 0; i < count; i++) { // Populate stars list with objects
					this.stars.push({
						x: (Math.random() * canvas.width),  // Random X
						y: (Math.random() * canvas.height), // Random Y
						speed: (Math.random() * 100)        // Random Speed
					});
				}
			}

			for(var i in this.stars) {
				ctx.fillStyle = this.color;
				ctx.beginPath();
				ctx.arc( // Render circles
					this.stars[i].x, // X Location
					this.stars[i].y, // Y Location
					1,               // Radius of stars
					0,               // Dunno lol
					Math.PI * 2,     // Dunno lol
					true             // Dunno lol
				);
				ctx.closePath();
				ctx.fill();
			}
		},
		update: function(delta) {
			for(var i in this.stars) {
				if(this.stars[i].speed < 30) { // Set min speed of stars
					this.stars[i].speed += 30;
				}

				this.stars[i].x = this.stars[i].x - (this.stars[i].speed * delta);

				if(this.stars[i].x < 0) {
					this.stars[i].x     = canvas.width;
					this.stars[i].speed = (Math.random() * 100);
				}
			}
		}
	}
};


// Player object
var player = (function() {
	var that = this;

	that = {
		x: canvas.width / 20,
		y: (canvas.height - 38) / 2,
		height: 38,
		width: 60,
		speed: 300,
		frames: [],
		frameDelta: 0,
		frameChangeDelta: 0.07,
		currentFrame: 0,
		shootDelta: 0,
		shootCooldown: 0.1,

		update: function(delta) {                      // Update player
			this.shootDelta += delta;
			this.frameDelta += delta;

			if(this.frameDelta > 0.07) {
				this.frameDelta = 0;
				
				this.currentFrame++;

				if(this.currentFrame > 5) {
					this.currentFrame = 0;
				}
			}
		},
		render: function() {                           // Draw player
			if(this.frames[this.currentFrame]) {
				ctx.drawImage(this.frames[this.currentFrame], this.x, this.y);
			}
		},
		moveUp: function(delta) {
			this.y -= this.speed * delta;

			if(this.y < 0) {                           // Don't allow moving outside of screen
				this.y = 0;
			}
		},
		moveDown: function(delta) {
			this.y += this.speed * delta;

			if(this.y > canvas.height - this.height) { // Don't allow moving outside of screen
				this.y = canvas.height - this.height;
			}
		},
		shoot: function() {
			if(this.shootDelta > this.shootCooldown) { // If shooting cooldown in over, create new projectile and reset cooldown
				projectiles.push(new Projectile(this));
				this.shootDelta = 0;
			}
		}
	};

	// Put up array with img-tags and hook to know if image is ready
	for(var i = 0; i <= 5; i++) {
		that.frames.push(new Image());
	}

	// Fill imagetags with src
	for(var i in that.frames) {
		that.frames[i].src = 'player_f' + i + '.png';
	}

	return that;
})();


// Projectile Object
var projectiles = [];
var Projectile = function(who) {
	var that = this;

	that = {
		who: who,
		x: who.x +  who.width,
		y: who.y + (who.height / 2),
		height: 4,
		width: 15,
		speed: 1000,
		update: function(delta) {
			this.x = this.x + this.speed * delta;

			for(var i in projectiles) { // Clean up projectiles that exist outside of the screen
				if(projectiles[i].x > canvas.width) {
					delete projectiles[i];
				}
			}
		},
		render: function() { // Render projectile
			ctx.fillStyle = 'yellow';
			ctx.beginPath();
			ctx.rect(this.x, this.y, this.width, this.height);
			ctx.fill();
		}
	};

	return that;
};


// Player input
var keysDown = {};

addEventListener('keydown', function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener('keyup', function (e) {
	delete keysDown[e.keyCode];
}, false);


// Update everything!
var update = function(delta) {
	bg.stars.update(delta); // Move stars!
	player.update(delta);   // Animate player

	for(var i in projectiles) { // Update projectiles
		projectiles[i].update(delta);
	}

	if(32 in keysDown) { player.shoot();         } // Space is pressed
	if(38 in keysDown) { player.moveUp(delta);   } // Up    is pressed
	if(40 in keysDown) { player.moveDown(delta); } // Down  is pressed
}


// Render everything!
var render = function() {
	bg.sky.render();   // Render sky!
	bg.stars.render(); // Render stars!
	player.render();   // Render player!

	for(var i in projectiles) { // Render projectiles
		projectiles[i].render();
	}
}


// Main game loop
var gameLoop = function() {
	var now = Date.now();
	var delta = (now - then) / 1000;

	update(delta);
	render();

	then = now;
};

var then = Date.now();
setInterval(gameLoop, 1000 / 60);
