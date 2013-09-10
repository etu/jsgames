
/**
 * Player Class, handles player
 */
var Player = new Class({
	Implements: [ Options ],
	options: {
		speed:  200,
		spritemap: new Image(),
		width:  68,
		height: 40,
		frame:  0,
		frameDelta: 0,
		frameChange: 100 / 1000,
		frames: 5,
		lastUpdateTime: Date.now(),
		x: 0,
		y: 0
	},
	initialize: function(options) {
		// Override some default options, if I put the random operations
		// in the options object, it will be the same random for all objects :-)
		this.options.x   = Number.random(0, env.options.width);
		this.options.y   = Number.random(0, env.options.height);

		this.setOptions(options);

		this.options.ctx = env.options.ctxs.screen;

		this.options.spritemap.src = 'nyan.png';
	},
	move: function() { // Handle movement and animation of the player
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
		if(this.options.y < 0)                                        this.options.y = 0;
		if(this.options.y > env.options.height - this.options.height) this.options.y = env.options.height - this.options.height;
		if(this.options.x < 0)                                        this.options.x = 0;
		if(this.options.x > env.options.width  - this.options.width)  this.options.x = env.options.width - this.options.width;

		// Store update time
		this.options.lastUpdateTime = Date.now();
	},
	draw: function() { // Draw the player on the screen

		var frameoffset = this.options.frame * this.options.width;

		this.options.ctx.drawImage(
			this.options.spritemap,     // Image
			frameoffset,                // Source X Position (within image)
			0,                          // Source Y Position (within image)
			this.options.width,         // Source Width
			this.options.height,        // Source Height
			Math.round(this.options.x), // Canvas X
			Math.round(this.options.y), // Canvas Y
			this.options.width,         // Canvas Width
			this.options.height         // Canvas Height
		);
	}
});
