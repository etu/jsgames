
'use strict';

var canvas = document.createElement('canvas');
var ctx    = canvas.getContext('2d');

canvas.id     = 'canvas';
canvas.width  = 640;
canvas.height = 480;

window.addEvent('domready', function() {
	$('gameWrapper').appendChild(canvas);

	// Handle the custom fps field
	$('fps').addEvent('change', function() {
		var fps = $('fps').value;

		if(fps < 1 || fps > 120) {
			fps = 60;
			$('fps').value = fps;
		}

		gameState.fps = fps;
	});

	newGame();
});


// Some preloaded sounds
var audio = (function () {
	var that = this;

	that = {
		newGame: new Audio('charging.ogg'),
		point: new Audio('get_point.ogg'),
		die: new Audio('self_explode.ogg')
	};

	return that;
})();


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
				var count = Number.random(400, 600); // Decide amount

				for(var i = 0; i < count; i++) { // Populate stars list with objects
					this.stars.push({
						x: Number.random(0, canvas.width),  // Random X
						y: Number.random(0, canvas.height), // Random Y
						speed: Number.random(50, 70)        // Random Speed
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
					this.stars[i].speed = Number.random(50, 70);
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
		y: 0,
		width:  60,
		height: 38,
		speed: 300,              // Movement speed

		// Values for animation of cat
		frames: [],              // List of images used for animation
		frameDelta: 0,           // Current time since last frame-shift
		frameChangeDelta: 0.07,  // Time that need to pass before shifting frame
		currentFrame: 0,         // Current frame in player animation

		// Values for shooting cooldown
		shootDelta: 0,           // Current time since last shot
		shootCooldown: 0.15,     // Cooldown time for shooting

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

	if(gameState.audio) new Audio('pew.ogg').play();

	that = {
		who: who, // Object of who is shooting?

		// Place projectile top left in middle front of the shooter
		x: who.x +  who.width,
		y: who.y + (who.height / 2),

		width: 15,   // Width  of projectile
		height: 4,   // Height of projectile
		speed: 1000, // Projectile movement speed

		color: 'yellow', // Projectile color!

		update: function(delta) {
			this.x = this.x + this.speed * delta;

			for(var i in projectiles) { // Clean up projectiles that exist outside of the screen
				if(projectiles[i].x > canvas.width) {
					delete projectiles[i];
				}
			}
		},
		render: function() { // Render projectile
			ctx.fillStyle = this.color;
			ctx.beginPath();
			ctx.rect(this.x, this.y, this.width, this.height);
			ctx.fill();
		}
	};

	return that;
};


// Monster Object
var monsters = [];
var monsterSpawnDelta = 0;
var monsterSpawnRate = 3;
var Monster = function() {
	var that = this;

	that = {
		x: canvas.width,                         // As far away as possibru
		y: Number.random(0, canvas.height - 24), // Random Y
		width: 33,
		height: 24,
		speed: 100,
		color: 'red',
		shootDelta: 1,
		shootCooldown: 2,
		img: new Image(),

		update: function(delta) {
			if(gameState.insane) { // If insane-mode is on, add delta one more time
				this.shootDelta += delta;
			}
			this.shootDelta += delta;

			this.x = this.x - this.speed * delta;

			for(var i in monsters) { // Delete monsters outside of the screen
				if(monsters[i].x + monsters[i].width < 0) {
					delete monsters[i];

					if(gameState.insane) { // Spawn a new monster when the old one is out of the screen while in insane-mode
						monsters.push(new Monster());
					}
				}
			}

			if(this.shootDelta > this.shootCooldown) {
				this.shootDelta = 0;
				var proj = Projectile(this);
				proj.speed = -500;            // Inverse speed to move the projectiles left instead of right
				proj.x = this.x - proj.width; // Place the projectile left of the monster to not insta-kill it :)
				projectiles.push(proj);
			}
		},
		render: function() {
			ctx.drawImage(this.img, this.x, this.y);
		}
	};

	that.img.src = 'invader_' + Number.random(0, 3) + '.png'; // Choose a somewhat random image by random number 0-3

	return that;
};


// Detect if two objects is colliding or not
// Thanks to: http://theodosis-gameprogramming.blogspot.gr/2011/07/collision-detection-by-detecting-no.html
function isColliding(Object1, Object2) {
	if(Object1.x + Object1.width < Object2.x) {
		return false;
	}
	if(Object1.x > Object2.x + Object2.width) {
		return false;
	}
	if(Object1.y + Object1.height < Object2.y) {
		return false;
	}
	if(Object1.y > Object2.y + Object2.height) {
		return false;
	}

	return true;
};


// Player input
var keysDown = {};

addEventListener('keydown', function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener('keyup', function (e) {
	delete keysDown[e.keyCode];
}, false);


// Timed points vars
var timedPointsRate = 1;
var timedPointsDelta = 0;

var levelChangeRate  = 10;
var levelChangeDelta = 0;

// Update everything!
function update(delta) {
	if(monsterSpawnDelta > (monsterSpawnRate / gameState.level)) { // Spawn monster routine
		monsterSpawnDelta = 0;
		monsters.push(new Monster());
	} else {
		monsterSpawnDelta += delta;
	}

	if((timedPointsDelta * gameState.level) > timedPointsRate) { // Some points for just surviving
		timedPointsDelta = 0;
		gameState.points++;
	} else {
		timedPointsDelta += delta;
	}

	if(levelChangeDelta > levelChangeRate) { // Change level every now and then
		levelChangeDelta = 0;
		gameState.level++;
	} else {
		levelChangeDelta += delta;
	}

	bg.stars.update(delta); // Move stars!
	player.update(delta);   // Animate player

	Array.each(monsters, function(monster, id) {       // Update monsters
		monster.update(delta);
	});

	Array.each(projectiles, function(projectile, id) { // Update projectiles
		projectile.update(delta);
	});

	if(32 in keysDown) { player.shoot();         } // Space is pressed, shoot!
	if(38 in keysDown) { player.moveUp(delta);   } // Up    is pressed, move up!
	if(40 in keysDown) { player.moveDown(delta); } // Down  is pressed, move down!

	Array.each(monsters, function(monster, id) {
		if(isColliding(player, monster)) {
			gameOver();
		}
	});

	Array.each(projectiles, function(projectile, pid) {
		if(projectile.who == player) {
			Array.each(monsters, function(monster, mid) {
				if(isColliding(projectile, monster)) {
					delete monsters[mid];

					if(gameState.insane) monsters.push(new Monster());// Spawn a new monster if one dies in insane-mode
					if(gameState.audio)  audio.point.play();

					gameState.points += 10; // Count points!
				}
			});
		} else { // Player did NOT shoot this projectile
			if(isColliding(projectile, player)) {
				gameOver();
			}
		}
	});
}


// Render everything!
function render() {
	bg.sky.render();   // Render sky!
	bg.stars.render(); // Render stars!
	player.render();   // Render player!

	Array.each(monsters, function(monster, id) {
		monster.render();
	});

	Array.each(projectiles, function(projectile, id) {
		projectile.render();
	});

	ctx.fillStyle = 'white';
	ctx.font = 'bold 10pt Arial';
	ctx.fillText('Points: ' + gameState.points, 10, 20);
	ctx.fillText('Level: ' + gameState.level, 10, 40);
}


// Object with current gameState
var gameState = {
	gLoop:  undefined,
	rLoop:  undefined,
	points: 0,
	state:  true,
	fps:    60,
	then:   Date.now(),
	insane: false,
	audio:  ((new Audio()).canPlayType('audio/ogg; codecs=vorbis') == 'probably'),
	level:  1
};


// Launch new game!
function newGame() {
	if(gameState.audio) audio.newGame.play();

	// Reset projectiles
	projectiles = [];

	// Reset all monsters
	monsters          = [];
	monsterSpawnDelta = 2;
	monsterSpawnRate  = 3;

	// Let there be new stars!
	bg.stars.stars   = [];

	// Reset player position
	player.y = (canvas.height - player.height) / 2,

	// Reset more values
	timedPointsRate = 1;
	timedPointsDelta = 0;

	levelChangeRate  = 10;
	levelChangeDelta = 0;

	// Reset gameState
	gameState.state  = true;
	gameState.points = 0;
	gameState.level  = 1;
	gameState.gLoop  = setTimeout(gameLoop, 1);
	gameState.rLoop  = setTimeout(gameRenderLoop, 1);
};


// Game Render Loop
function gameRenderLoop() {
	render();

	if(gameState.state) {
		gameState.rLoop = setTimeout(gameRenderLoop, 1000 / gameState.fps);
	}
};

// Game Update Loop
function gameLoop() {
	var now = Date.now();
	var delta = (now - gameState.then) / 1000;

	update(delta);

	gameState.then = now;
	if(gameState.state) {
		gameState.gLoop = setTimeout(gameLoop, 10); // Run every 10ms no matter what fps, cuz mainloop doesn't render :)
	}
};


// Game Over screen
function gameOver() {
	gameState.state = false;

	if(gameState.audio) audio.die.play();

	clearTimeout(gameState.gLoop);

	setTimeout(function() {
		bg.sky.render();
		bg.stars.render();

		ctx.fillStyle = 'white';
		ctx.font = 'bold 20pt Arial';
		ctx.fillText('GAME OVER', canvas.width / 2 - 80, canvas.height / 2 - 30);
		ctx.font = 'bold 15px Arial';
		ctx.fillText('Points: ' + gameState.points, canvas.width / 2 - 60, canvas.height / 2 - 10);
	}, 100);
};


// Helper to toggle insanemode
function toggleInsane() {
	gameState.insane = !gameState.insane;

	var insane = document.getElementById('insane');

	if(gameState.insane) {
		insane.style.display = 'block';
	} else {
		insane.style.display = 'none';
	}
}


// Helper to toggle mute
function toggleMute() {
	if((new Audio()).canPlayType('audio/ogg; codecs=vorbis') == 'probably') {
		gameState.audio = !gameState.audio;

		var mute = document.getElementById('mute');
		if(gameState.audio) {
			mute.style.display = 'none';
		} else {
			mute.style.display = 'block';
		}
	}
}

