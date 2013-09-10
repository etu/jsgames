
'use strict';

/**
 * StarField Class, handles the entire Star Field
 */
var StarField = new Class({
	Implements: [ Options ],
	options: {
		lastUpdateTime: Date.now(),
		stars:          [],
		warp:           false,
		ctx:            null,
		frameSkip:      false
	},
	initialize: function(options) {
		this.setOptions(options);

		// Set reference to canvas context
		this.options.ctx = env.options.ctxs.background;

		// Populate list of stars
		for(var i = 0; i < Number.random(100, 150); i++) {
			this.options.stars.push(new Star());
		}
	},
	move: function() {
		var delta = (Date.now() - this.options.lastUpdateTime) / 1000;

		// Move all stars
		Array.each(this.options.stars, function(star) {
			star.move(delta);
		});

		// Save date to use for next delta calculation
		this.options.lastUpdateTime = Date.now();

		// Only render every second frame to save power
		if(this.options.frameSkip) {
			this.draw();
		}
		// Toggle frameskip
		this.options.frameSkip = !this.options.frameSkip;
	},
	draw: function() {
		var that = this;

		// Clear canvas if not warping
		if(!this.options.warp) {
			that.options.ctx.clearRect(0, 0, env.options.width, env.options.height);
		}

		// Render stars
		Array.each(this.options.stars, function(star) {
			star.draw(that.options.ctx);
		});
	}
});


/**
 * Star Class, handles stars
 */
var Star = new Class({
	Implements: [ Options ],
	options: {
		speed: 0,
		color: '#ffffff',
		y: 0,
		x: 0
	},
	initialize: function(options) {
		// Override some default options, if I put the random operations
		// in the options object, it will be the same random for all stars :)
		this.options.speed = Number.random(25, 50);
		this.options.y     = Number.random(0, env.options.height);
		this.options.x     = Number.random(0, env.options.width);

		// Set options
		this.setOptions(options);
	},
	move: function(delta) {
		// Move the star
		this.options.x -= (this.options.speed * delta);

		// If outside, move to the right part of the screen
		// And set a new speed.
		if(this.options.x < 0) {
			this.options.x = env.options.width;
			this.options.speed = Number.random(50, 100);
		}
	},
	draw: function(ctx) {
		ctx.fillStyle = this.options.color;
		ctx.fillRect(Math.round(this.options.x), this.options.y, 1, 1); // X, Y, Width, Height
	}
});

