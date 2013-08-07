
'use strict';

// Setup canvas
var canvas = document.createElement('canvas');
var ctx    = canvas.getContext('2d');
canvas.width  = 640;
canvas.height = 480;
document.body.appendChild(canvas);

// Game Object
var gameObjects = {
	bg: {
		sky: {
			color: '#4795e5',
			render: function() {
				ctx.fillStyle = this.color;
				ctx.beginPath();
				ctx.rect(0, 0, canvas.width, canvas.height);
				ctx.closePath();
				ctx.fill();
			}
		},
		clouds: (function () {
			var that = this;

			that = {
				speed: 150,
				circles: [],
				circleCount: Math.floor((Math.random() * 100) % 17) + 7,
				render: function() {
					if(this.circles.length == 0) { // Define circles if not defined
						for(var i = 0; i < this.circleCount; i++) {
							this.circles.push([
								Math.random() * canvas.width,  // X coord
								Math.random() * canvas.height, // Y coord
								Math.random() * 100,           // Radius
								Math.random() / 2              // Alpha
							]);
						}
					}

					for(var i = 0; i < this.circleCount; i++) { // Render circles
						ctx.fillStyle = 'rgba(255, 255, 255, ' + this.circles[i][3] + ')';
						ctx.beginPath();
						ctx.arc(
							this.circles[i][0],
							this.circles[i][1],
							this.circles[i][2],
							0,
							Math.PI * 2, true
						);
						ctx.closePath();
						ctx.fill();
					}
				},
				move: function(delta) { // Move clouds
					if(this.circles.length == 0) { // Render clouds if they are missing
						this.render();
					}

					for(var i = 0; i < this.circleCount; i++) {
						if((this.circles[i][0] + this.circles[i][2]) < 0) { // If circle is entire outside the screen to the left side

							this.circles[i][0] = Math.random() * canvas.width; // New X coord
							this.circles[i][2] = Math.random() * 100;          // New Radius
							this.circles[i][3] = Math.random() / 2;            // New Alpha
						} else {
							this.circles[i][0] -= delta * this.speed * (this.circles[i][2] / 100); // Delta * Speed * Size of cloud / 100
						}
					}
				}
			};

			return that;
		})(),
	},
	player: (function () {
		var that = this;

		that = {
			x: 0,
			y: 0,
			width: 32,
			height: 32,
			isJumping: false,
			jumpSpeed: 0,
			jumpSpeedModifier: 2.5,
			gravityConstant: 9.81,
			speed: 150,
			img: { // Img object and status
				tag: new Image(),
				ready: false
			},
			setPosition: function(x, y) { // Set position for player
				// Don't ever place player outside of canvas
				if(x < 0) x = 0;
				if(y < 0) y = 0;
				if(x + this.width  > canvas.width ) x = canvas.width  - this.width;
				if(y + this.height > canvas.height) y = canvas.height - this.height;

				this.x = x;
				this.y = y;
			},
			render: function() { // Render player
				if(this.img.ready) {
					ctx.drawImage(this.img.tag, this.x, this.y);
				}
			},
			jump: function() {   // Initiate jumping
				if(!this.isJumping) {
					this.isJumping = true;
					this.jumpSpeed = this.speed * this.jumpSpeedModifier;
				}
			},
			checkJump: function(delta) { // Check jump and enable fall if at top of jump
				var orig_y = this.y;

				this.move(0, delta * this.jumpSpeed / 100);
				this.jumpSpeed = this.jumpSpeed - this.gravityConstant * delta * 100;

				if(orig_y == this.y) {
					this.isJumping = false;
				}
			},
			move: function(direction, delta) { // Move player in direction
				/**
				 *       C
				 *      /|
				 *   b / |
				 *    /  |a
				 *   /   |
				 * A/____|B
				 *     c
				 */

				var side_b = this.speed * delta;
				var angle_a = direction % 90;
				var angle_b = 90;
				var angle_c = 180 - angle_a - angle_b;

				if(angle_a == 0) {
					switch((direction / 90) % 4) { // Handle straight directions, up right down left
						case 0: // Up
							this.setPosition(this.x, this.y - side_b);
							break;
						case 1: // Right
							this.setPosition(this.x + side_b, this.y);
							if(!this.isOnPlatform()) {
								for(var i in gameObjects.platform.platforms) {
									if(detectCollision(this, gameObjects.platform.platforms[i])) {
										this.setPosition(this.x - side_b, this.y); // @TODO: instead of reverting the operation on the player, change it to match the platform
										return;
									}
								}
							}
							break;
						case 2: // Down
							this.setPosition(this.x, this.y + side_b);
							break;
						case 3: // Left
							this.setPosition(this.x - side_b, this.y);
							if(!this.isOnPlatform()) {
								for(var i in gameObjects.platform.platforms) {
									if(detectCollision(this, gameObjects.platform.platforms[i])) {
										this.setPosition(this.x + side_b, this.y); // @TODO: instead of reverting the operation on the player, change it to match the platform
										return;
									}
								}
							}
							break;
					}
					return;
				}

				// Convert all angles to radians
				angle_a = angle_a * (Math.PI / 180);
				angle_b = angle_b * (Math.PI / 180);
				angle_c = angle_c * (Math.PI / 180);

				// Calculate missing sides
				var side_c = (side_b * Math.sin(angle_c)) / Math.sin(angle_b);
				var side_a = (side_b * Math.sin(angle_a)) / Math.sin(angle_b);

				// Handle angles towards all directions
				switch(Math.floor((direction % 360) / 90)) {
					case 0:
						var newx = this.x + side_a; // Swap sides of triangle if in first quadrant cuz of the triangle position
						var newy = this.y - side_c;
						break;
					case 1:
						var newx = this.x + side_c;
						var newy = this.y + side_a;
						break;
					case 2:
						var newx = this.x - side_c;
						var newy = this.y + side_a;
						break;
					case 3:
						var newx = this.x - side_c;
						var newy = this.y - side_a;
						break;
				}

				this.setPosition(newx, newy);
			},
			isOnPlatform: function() { // Detect is player is standing on a platform
				var platforms = gameObjects.platform.platforms;
				var relevant_platforms = [];

				var player_bottom_y = this.y + this.height;
				var player_left_x   = this.x;
				var player_right_x  = this.x + this.width;

				for(var i in platforms) {
					if((player_bottom_y == platforms[i].y) && (player_right_x  >  platforms[i].x) && (player_left_x   <  platforms[i].x + platforms[i].width)) {
						return true;
					}
				}
				return false;
			}
		};

		// Instant set start position
		that.setPosition(Math.floor((canvas.width - that.width) / 2),  Math.floor((canvas.height - that.height) / 2));
		that.jump();

		return that;
	})(),
	platform: (function () {
		var that = this;

		that = {
			platforms: [
				{
					x: 0,
					y: canvas.height - 5,
					width: canvas.width,
					height: 5,
					c1: 'rgba(0, 0, 0, 1)',
					c2: '#cccccc'
				},{
					x: 10,
					y: 400,
					width: 100,
					height: 25,
					c1: 'rgba(0, 0, 0, 1)',
					c2: '#cccccc'
				},{
					x: 200,
					y: 350,
					width: 100,
					height: 25,
					c1: 'rgba(0, 0, 0, 1)',
					c2: '#cccccc'
				},{
					x: 390,
					y: 300,
					width: 100,
					height: 25,
					c1: 'rgba(0, 0, 0, 1)',
					c2: '#cccccc'
				}
			],
			render: function() { // Render platforms
				for(var i in this.platforms) {
					ctx.fillStyle = this.platforms[i].c1;

					var gradient = ctx.createRadialGradient(
						this.platforms[i].x + (this.platforms[i].width  / 2),
						this.platforms[i].y + (this.platforms[i].height / 2),
						5,
						this.platforms[i].x + (this.platforms[i].width  / 2),
						this.platforms[i].y + (this.platforms[i].height / 2),
						45
					);

					gradient.addColorStop(0, this.platforms[i].c1);
					gradient.addColorStop(1, this.platforms[i].c2);

					ctx.fillStyle = gradient;
					ctx.fillRect(this.platforms[i].x, this.platforms[i].y, this.platforms[i].width, this.platforms[i].height);
				}
			},
			checkCollisions: function () { // Collision detection!
				var collides = false;

				for(var i in this.platforms) {
					if(detectCollision(gameObjects.player, this.platforms[i])) {
						if(collides == false) {
							collides = true;
						}

						this.onCollide(i);
					} else {
						if(!gameObjects.player.isJumping) {
							gameObjects.player.isJumping = false;
							gameObjects.player.jumpSpeed = 0;
						}
						if(gameObjects.player.canFall) {
							if(!gameObjects.player.isOnPlatform() && !gameObjects.player.isJumping) {
								gameObjects.player.isJumping = true;
								gameObjects.player.jumpSpeed = -1;
							}
						}
					}
				}
			},
			onCollide: function(platformId) {
				if(gameObjects.player.isJumping) {
					if(gameObjects.player.jumpSpeed > 0) { // Player is on the way up
						// Change direction
						gameObjects.player.jumpSpeed = -1;

						// Ensure that player is outside of object
						gameObjects.player.setPosition(gameObjects.player.x, (this.platforms[platformId].y + this.platforms[platformId].height));
					} else { // Player is on the way down
						if(gameObjects.player.isJumping) {
							// Abort Jumping
							gameObjects.player.isJumping = false;
							gameObjects.player.jumpSpeed = 0;
							gameObjects.player.canFall   = true;

							// Ensure that player is outside of object
							gameObjects.player.setPosition(gameObjects.player.x, (this.platforms[platformId].y - gameObjects.player.height));
						}
					}
				}
			}
		};

		return that;
	})()
};


// Player input
var keysDown = {};

addEventListener('keydown', function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener('keyup', function (e) {
	delete keysDown[e.keyCode];
}, false);


// Detect Collision
var detectCollision = function(A, B) {
	if((A.x + A.width < B.x)
	   || (A.x > B.x + B.width)
	   || (A.y + A.height < B.y)
	   || (A.y > B.y + B.height)) {
		return false;
	}

	return true;
}


// Render function
var render = function() {
	gameObjects.bg.sky.render();
	gameObjects.bg.clouds.render();
	gameObjects.player.render();
	gameObjects.platform.render();
}


// New Game
var newGame = function() {
	gameObjects.player.img.tag.onload = function() {
		gameObjects.player.img.ready = true;
	};
	gameObjects.player.img.tag.src = 'player.png';
	
	gameObjects.player.x = (canvas.width  - gameObjects.player.width)  / 2;
	gameObjects.player.y = (canvas.height - gameObjects.player.height) / 2;
};


// Main game loop
var gameLoop = function() {
	var now = Date.now();
	var delta = (now - then) / 1000;

	gameObjects.bg.clouds.move(delta); // Move clouds

	if(32 in keysDown) gameObjects.player.jump();           // Player holding space
	if(39 in keysDown) gameObjects.player.move(90,  delta); // Holding Right
	if(37 in keysDown) gameObjects.player.move(270, delta); // Holding Left

	// Control jumping routines
	if(gameObjects.player.isJumping) gameObjects.player.checkJump(delta);

	// Check collisions with platforms
	gameObjects.platform.checkCollisions();

	// Render current frame
	render();

	then = now;
};


// Run shit!
newGame();
var then = Date.now();
setInterval(gameLoop, 1000 / 60);

