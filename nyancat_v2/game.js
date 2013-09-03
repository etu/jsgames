
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
	Implements: [ Options ],
	options: {
		lastUpdateTime: Date.now(),
		x: 0,
		y: 0
	},
	initialize: function(options) {
		// Override some default options, if I put the random operations
		// in the options object, it will be the same random for all objects :-)
		this.options.x = Number.random(0, env.width);
		this.options.y = Number.random(0, env.height);

		this.setOptions(options);

		env.gameObjects.push(this);
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
	options: {
		speed: 0,
		color: '#ffffff',
		y: 0,
		x: 0
	},
	initialize: function(options) {
		env.backgroundObjects.push(this);

		// Override some default options, if I put the random operations
		// in the options object, it will be the same random for all stars :)
		this.options.speed = Number.random(25, 50);
		this.options.y     = Number.random(0, env.height);
		this.options.x     = Number.random(0, env.width);

		// Set options
		this.setOptions(options);
	},
	move: function() {
		var delta = (Date.now() - this.options.lastUpdateTime) / 1000;

		// Move the star
		this.options.x -= (this.options.speed * delta);

		// If outside, move to the right part of the screen
		// And set a new speed.
		if(this.options.x < 0) {
			this.options.x = env.width;
			this.options.speed = Number.random(50, 100);
		}

		// Store update time
		this.options.lastUpdateTime = Date.now();

		// Draw it
		this.draw();
	},
	draw: function() {
		var ctx = env.ctx.background;

		ctx.fillStyle = this.options.color;
		ctx.fillRect(this.options.x, this.options.y, 1, 1); // X, Y, Width, Height
	}
});


/**
 * Player Class, handles player
 */
var Player = new Class({
	Extends: BaseClass,
	options: {
		speed: 200
	},
	initialize: function(options) {
		this.setOptions(options);

		this.parent(options);
	},
	move: function() {
		var delta = (Date.now() - this.options.lastUpdateTime) / 1000;

		// Some simple movements
		if(keyStates.up)    this.options.y -= this.options.speed * delta;
		if(keyStates.down)  this.options.y += this.options.speed * delta;
		if(keyStates.left)  this.options.x -= this.options.speed * delta;
		if(keyStates.right) this.options.x += this.options.speed * delta;

		// Some simple checks to keep it inside of the canvas
		// @TODO: Do not use 30 here, use the players width
		if(this.options.y < 0)               this.options.y = 0;
		if(this.options.y > env.height - 30) this.options.y = env.height - 30;
		if(this.options.x < 0)               this.options.x = 0;
		if(this.options.x > env.width - 30)  this.options.x = env.width - 30;

		// Store update time
		this.options.lastUpdateTime = Date.now();

		this.draw();
	},
	draw: function() {
		var ctx = env.ctx.screen;

		// @TODO: Render images instead of a green cube :)
		ctx.fillStyle = '#00ff00';
		ctx.fillRect(this.options.x, this.options.y, 30, 30);
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
