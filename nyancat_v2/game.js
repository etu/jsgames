
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
	env.backgroundObjects = [];
	for(var i = 0; i < Number.random(100, 151); i++) {
		new Star();
	}
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

/**
 * BaseClass with basic creating of objects and basic structure
 */
var BaseClass = new Class({
	initialize: function(x, y) {
		env.gameObjects.push(this);

		this.x = x ? x : Number.random(0, env.width);
		this.y = y ? y : Number.random(0, env.height);
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

	window.requestAnimationFrame(gameLoop);
}
