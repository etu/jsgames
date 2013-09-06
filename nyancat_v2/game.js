
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
		speed:  200,
		spritemap: new Image(),
		width:  68,
		height: 40,
		frame:  0,
		frameDelta: 0,
		frameChange: 100 / 1000,
		frames: 5
	},
	initialize: function(options) {
		this.setOptions(options);

		this.options.spritemap.src = 'nyan.png';

		this.parent(options);
	},
	move: function() {
		var delta = (Date.now() - this.options.lastUpdateTime) / 1000;

		if(this.options.frameDelta > this.options.frameChange) {
			++this.options.frame;

			if(this.options.frame > this.options.frames) {
				this.options.frame = 0;
			}

			this.options.frameDelta = 0;
		}
		this.options.frameDelta += delta;

		// Some simple movements
		if(keyStates.up)    this.options.y -= this.options.speed * delta;
		if(keyStates.down)  this.options.y += this.options.speed * delta;
		if(keyStates.left)  this.options.x -= this.options.speed * delta;
		if(keyStates.right) this.options.x += this.options.speed * delta;

		// Some simple checks to keep it inside of the canvas
		if(this.options.y < 0)                                this.options.y = 0;
		if(this.options.y > env.height - this.options.height) this.options.y = env.height - this.options.height;
		if(this.options.x < 0)                                this.options.x = 0;
		if(this.options.x > env.width  - this.options.width)  this.options.x = env.width - this.options.width;

		// Store update time
		this.options.lastUpdateTime = Date.now();

		this.draw();
	},
	draw: function() {
		var ctx = env.ctx.screen;

		var frameoffset = this.options.frame * this.options.width;

		ctx.drawImage(
			this.options.spritemap, // Image
			frameoffset,            // Source X Position (within image)
			0,                      // Source Y Position (within image)
			this.options.width,     // Source Width
			this.options.height,    // Source Height
			this.options.x,         // Canvas X
			this.options.y,         // Canvas Y
			this.options.width,     // Canvas Width
			this.options.height     // Canvas Height
		);
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

