
var Player = new Class({
	ctx:     undefined,

	x:       undefined,
	y:       undefined,
	width:   20,
	height:  20,

	jspeed:  0,
	jumping: false,

	g: 10,

	initialize: function(o) {
		this.ctx = o.ctx;

		this.x = Math.floor(o.env.width / 5);
		this.y = o.y ? o.y : Number.random(0, (o.env.height - this.height));
	},
	update: function(delta) {
		if(keyStates.space) {
			this.jump();
			delete keyStates.space;
		}

		if(this.jumping) this.checkJump(delta);
	},
	draw: function() {
		this.ctx.fillStyle = '#ff00ff';
		this.ctx.beginPath();
		this.ctx.rect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
		this.ctx.closePath();
		this.ctx.fill();
	},

	jump: function() {
		this.jumping = true;
		this.jspeed  = 400;
	},
	checkJump: function(delta) {
		this.jspeed -= this.g;

		this.y -= this.jspeed * delta;
	}
});

