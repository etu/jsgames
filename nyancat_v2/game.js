
'use strict';

var env = {
	ctx:         {},
	starfield:   false, // Storage of the starfield master object
	gameObjects: [],
	width:       640,
	height:      480
};


/**
 * newGame -- Resets values and stuff
 */
function newGame() {
	env.starfield = new StarField();

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
	// Update starfield
	env.starfield.move();

	/**
	 * Update Game Objects
	 */
	env.ctx.screen.clearRect(0, 0, env.width, env.height);
	Array.each(env.gameObjects, function(object) {
		object.move();
	});

	window.requestAnimationFrame(gameLoop);
}

