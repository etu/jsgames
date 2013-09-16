
var Map = new Class({
	ctx: undefined,
	map: undefined,
	current: undefined,

	initialize: function(o) {
		this.ctx = o.ctx;

		this.setLevel(o.level ? o.level : 0);
	},
	setLevel: function(level) {
		if(maps[level]) {
			this.current = level;
			this.map     = Array.clone(maps[level]);

			return true;
		}

		return false;
	},
	update: function(delta, speed) {
		Array.each(this.map, function(tile) {
			tile.update(delta, speed);
		});
	},
	draw: function() {
		var self = this;

		Array.each(this.map, function(tile) {
			tile.draw(self.ctx);
		});
	}
});

var MapTile = new Class({
	x: undefined,
	y: undefined,
	width: undefined,
	height: undefined,

	initialize: function(o) {
		this.x      = o.x;
		this.y      = o.y;
		this.width  = o.width;
		this.height = o.height;
	},
	update: function(delta, speed) {
		this.x -= delta * speed;
	},
	draw: function(ctx) {
		ctx.fillStyle = '#ff0000';
		ctx.beginPath();
		ctx.rect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
		ctx.closePath();
		ctx.fill();
	}
});

var maps = [
	[
		new MapTile({x: 10, y: 400, width: 200, height: 50}),
		new MapTile({x: 230, y: 380, width: 200, height: 50}),
		new MapTile({x: 450, y: 400, width: 200, height: 50}),
		new MapTile({x: 670, y: 380, width: 200, height: 50}),
	]
];

