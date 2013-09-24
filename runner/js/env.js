
var Environment = new Class({
	map: undefined,
	ctxs: {},
	width: 640,
	height: 480,
	player: undefined,
	objects: [],
	background: undefined,
	loopWrapper: undefined,
	lastUpdateTime: undefined,

	initialize: function(options) {
		this.ctxs.background = $('background').getContext('2d');
		this.ctxs.screen     = $('screen').getContext('2d');


		this.map        = new Map({ctx:    this.ctxs.screen, env: this});
		this.player     = new Player({ctx: this.ctxs.screen, env: this});
		this.background = 'bg';


		this.loopWrapper    = (function (that) { that.mainLoop(); }).pass(this);
		this.lastUpdateTime = Date.now();


		window.requestAnimationFrame(this.loopWrapper);
	},
	update: function() {
		var delta = (Date.now() - this.lastUpdateTime) / 1000;

		this.player.update(delta);
		this.map.update(delta, 200);

		this.lastUpdateTime = Date.now();
	},
	draw: function() {
		this.ctxs.screen.clearRect(0, 0, this.width, this.height);

		this.player.draw();
		this.map.draw();
	},
	mainLoop: function() {
		this.update();
		this.draw();

		window.requestAnimationFrame(this.loopWrapper);
	}
});

