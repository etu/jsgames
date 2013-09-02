
'use strict';

var env = {
	ctx: {},
	gameObjects: [],
	backgroundFrame: true,
	backgroundObjects: [],
	width:  640,
	height: 480
};

/**
 * newGame -- Resets values and stuff
 */
function newGame() {
	// Clear the sky
	env.backgroundObjects = [];
	// make a new sky
	for(var i = 0; i < Number.random(100, 151); i++) {
		new Star();
	}

	// Clear game objects
	env.gameObjects = [];

	// Make a player
	new Player();
}

/**
 * Launch game on load of all resources
 */
window.addEvent('load', function() {
	env.ctx.background = $('background').getContext('2d');
	env.ctx.screen     = $('screen').getContext('2d');

	newGame();

	window.requestAnimationFrame(gameLoop);
});

// Record keypresses
var keyStates = {};
window.addEvent('keydown', function(e) { if(keyStates[e.key] !== null) keyStates[e.key] = true; });
window.addEvent('keyup',   function(e) { delete keyStates[e.key]; });

/**
 * BaseClass with basic creating of objects and basic structure
 */
var BaseClass = new Class({
	initialize: function(x, y) {
		env.gameObjects.push(this);

		this.x = x ? x : Number.random(0, env.width);
		this.y = y ? y : Number.random(0, env.height);

		this.lastUpdateTime = Date.now();
	},
	move: function() {
		this.draw();
	},
	draw: function() {
	}
});

/**
 * Star Class, handles stars
 */
var Star = new Class({
	Extends: BaseClass,
	initialize: function(x, y) {
		env.backgroundObjects.push(this);

		this.x = x ? x : Number.random(0, env.width);
		this.y = y ? y : Number.random(0, env.height);

		this.speed = Number.random(25, 50);
		this.color = '#ffffff';

		this.lastUpdateTime = Date.now();
	},
	move: function() {
		var delta = (Date.now() - this.lastUpdateTime) / 1000;

		// Move the star
		this.x -= (this.speed * delta);

		// If outside, move to the right part of the screen
		// And set a new speed.
		if(this.x < 0) {
			this.x = env.width;
			this.speed = Number.random(50, 100);
		}

		// Store update time
		this.lastUpdateTime = Date.now();

		// Draw it
		this.draw();
	},
	draw: function() {
		var ctx = env.ctx.background;

		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, 1, 1); // X, Y, Width, Height
	}
});

/**
 * Player Class, handles player
 */
var Player = new Class({
	Extends: BaseClass,
	initialize: function(x, y) {
		this.parent(x, y);
		this.speed = 200;
	},
	move: function() {
		var delta = (Date.now() - this.lastUpdateTime) / 1000;

		// Some simple movements
		if(keyStates.up)    this.y -= this.speed * delta;
		if(keyStates.down)  this.y += this.speed * delta;
		if(keyStates.left)  this.x -= this.speed * delta;
		if(keyStates.right) this.x += this.speed * delta;

		// Some simple checks to keep it inside of the canvas
		// @TODO: Do not use 30 here, use the players width
		if(this.y < 0)               this.y = 0;
		if(this.y > env.height - 30) this.y = env.height - 30;
		if(this.x < 0)               this.x = 0;
		if(this.x > env.width - 30)  this.x = env.width - 30;

		// Store update time
		this.lastUpdateTime = Date.now();

		this.draw();
	},
	draw: function() {
		var ctx = env.ctx.screen;

		// @TODO: Render images insdead of a green cube :)
		ctx.fillStyle = '#00ff00';
		ctx.fillRect(this.x, this.y, 30, 30);
	}
});

/**
 * gameLoop which renders stuff
 */
function gameLoop() {
	/**
	 * Start rendering background objects
	 *
	 * Just render it every second frame to save render power
	 */
	if(env.backgroundFrame) {
		env.ctx.background.clearRect(0, 0, env.width, env.height);
		Array.each(env.backgroundObjects, function(object) {
			object.move();
		});
	}
	env.backgroundFrame = !env.backgroundFrame; // Toggle frame for background

	/**
	 * Update Game Objects
	 */
	env.ctx.screen.clearRect(0, 0, env.width, env.height);
	Array.each(env.gameObjects, function(object) {
		object.move();
	});

	window.requestAnimationFrame(gameLoop);
}
