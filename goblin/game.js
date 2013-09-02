
"use strict";

// Setup canvas element
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);


// State
var gameState = {
	monstersCaught: 0,
	background: {
		ready: false,
		image: new Image()
	},
	player: {
		speed: 256,
		x: 0,
		y: 0,
		ready: false,
		image: new Image()
	},
	monster: {
		speed: 512,
		x: 0,
		y: 0,
		ready: false,
		image: new Image()
	}
};


// Load images
gameState.background.image.onload = function() { gameState.background.ready = true; }
gameState.background.image.src    = 'background.png';

gameState.player.image.onload     = function() { gameState.player.ready = true; }
gameState.player.image.src        = 'player.png';

gameState.monster.image.onload    = function() { gameState.monster.ready = true; }
gameState.monster.image.src       = 'monster.png';


// Player input
var keysDown = {};

addEventListener('keydown', function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener('keyup', function (e) {
	delete keysDown[e.keyCode];
}, false);


// New Monster
var reset_monster = function () {
	// Throw the monster somewhere on the screen randomly
	gameState.monster.x = 32 + (Math.random() * (canvas.width  - 64));
	gameState.monster.y = 32 + (Math.random() * (canvas.height - 64));
};


// New game
var new_game = function () {
	gameState.monstersCaught = 0;
	gameState.player.x = canvas.width / 2;
	gameState.player.y = canvas.height / 2;

	reset_monster();
};


// Move Character
var move_character = function (character, direction, diff) {
	if(character == 'player') {
		var character = gameState.player;
	} else {
		var character = gameState.monster;
	}

	if(direction == 'x') {
		character.x += diff;

		// Don't allow walking outside the gaming area
		if(character.x < 0) {
			character.x = 0;
		}
		if(character.x > (canvas.width - 32)) {
			character.x = canvas.width - 32;
		}
		
	} else {
		character.y += diff;
		
		// Don't allow walking outside the gaming area
		if(character.y < 0) {
			character.y = 0;
		}
		if(character.y > (canvas.height - 32)) {
			character.y = canvas.height - 32;
		}
	}
};


// Update game objects
var update = function (modifier) {
	if(38 in keysDown) { // Player holding up
		move_character('player', 'y', -gameState.player.speed * modifier);
	}
	if(40 in keysDown) { // Player holding down
		move_character('player', 'y', gameState.player.speed * modifier);
	}
	if(37 in keysDown) { // Player holding left
		move_character('player', 'x', -gameState.player.speed * modifier);
	}
	if(39 in keysDown) { // Player holding right
		move_character('player', 'x', gameState.player.speed * modifier);
	}

	// Are they touching?
	if(gameState.player.x      <= (gameState.monster.x + 32)
		&& gameState.monster.x <= (gameState.player.x + 32)
		&& gameState.player.y  <= (gameState.monster.y + 32)
		&& gameState.monster.y <= (gameState.player.y + 32)) {
		gameState.monstersCaught++;
		reset_monster();
	}
};


// Draw everything
var render = function () {
	if(gameState.background.ready) { ctx.drawImage(gameState.background.image, 0,                   0);                   }
	if(gameState.player.ready)     { ctx.drawImage(gameState.player.image,     gameState.player.x,  gameState.player.y);  }
	if(gameState.monster.ready)    { ctx.drawImage(gameState.monster.image,    gameState.monster.x, gameState.monster.y); }

	// Score
	ctx.fillStyle ='rgb(250, 250, 250)';
	ctx.font = '24px Helvetica';
	ctx.textAlign = 'left';
	ctx.textBaseline = 'top';
	ctx.fillText('Goblins caught: ' + gameState.monstersCaught, 32, 32);
};


// Move the monster a bit
var move_monster = function (modifier) {
	var distance = canvas.height / 6;

	if(gameState.player.x < gameState.monster.x) {
		if((gameState.monster.x - gameState.player.x) < distance) {
			move_character('monster', 'x', gameState.monster.speed * modifier);
		}
	} else if(gameState.player.x == gameState.monster.x) {
		if(gameState.player.x == 0) {
			move_character('monster', 'x', 1);
		} else {
			move_character('monster', 'x', -1);
		}
	} else {
		if((gameState.player.x - gameState.monster.x) < distance) {
			move_character('monster', 'x', -gameState.monster.speed * modifier);
		}
	}
	
	if(gameState.player.y < gameState.monster.y) {
		if((gameState.monster.y - gameState.player.y) < distance) {
			move_character('monster', 'y', gameState.monster.speed * modifier);
		}
	} else if(gameState.player.y == gameState.monster.y) {
		if(gameState.player.y == 0) {
			move_character('monster', 'y', 1);
		} else {
			move_character('monster', 'y', -1);
		}
	} else {
		if((gameState.player.y - gameState.monster.y) < distance) {
			move_character('monster', 'y', -gameState.monster.speed * modifier);
		}
	}
};


// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	move_monster(delta / 1000);
	
	render();

	then = now;
};


// Let's play this game!
new_game();
var then = Date.now();
setInterval(main, 1); // Execute as fast as possible

