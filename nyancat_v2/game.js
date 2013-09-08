
'use strict';

var env = {
	ctx:         {},
	starfield:   false, // Storage of the starfield master object
	gameObjects: [],
	width:       640,
	height:      480,
	pause:       false
};


/**
 * newGame -- Resets values and stuff
 */
function newGame() {
	// Clear game objects
	env.gameObjects = [];

	env.starfield = new StarField(); // Replace Starfield
	env.player    = new Player();    // Replace Player
}


/**
 * Launch game on load of all resources
 */
window.addEvent('load', function() {
	env.ctx.background = $('background').getContext('2d');
	env.ctx.screen     = $('screen').getContext('2d');

	newGame();

	window.requestAnimationFrame(gameLoop);

	// unpause button :)
	$('unpause').addEvent('click', function(e) {
		unpause();
	});
});


// Automagic pause if you loose focus of the game
window.addEvent('blur', function() {
	pause();
});


// Record keypresses
var keyStates = {};
window.addEvent('keydown', function(e) {
	if(keyStates[e.key] !== null) keyStates[e.key] = true;

	if(keyStates.p) { // Hotkey for pausing/unpausing
		if(env.pause) unpause();
		else pause();
	}
});
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
 * gameLoop which renders stuff
 */
function gameLoop() {
	// Update starfield
	env.starfield.move();

	/**
	 * Clear entire screen
	 */
	env.ctx.screen.clearRect(0, 0, env.width, env.height);

	// Draw player
	env.player.move();

	// Draw other game objects
	Array.each(env.gameObjects, function(object) {
		object.move();
	});

	if(!env.pause) {
		window.requestAnimationFrame(gameLoop);
	}
}

/**
 * Function to unpause the game when it's paused
 */
function unpause() {
	var time = Date.now();

	$('pausescreen').setStyle('display', 'none');

	// update timers
	env.player.options.lastUpdateTime = time;
	env.starfield.options.lastUpdateTime = time;

	env.pause = false;

	window.requestAnimationFrame(gameLoop);
}

/**
 * Function to pause the game
 */
function pause() {
	$('pausescreen').setStyle('display', 'block');

	env.pause = true;
}
