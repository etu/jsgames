
'use strict';

var env, keyStates = {};

window.addEvent('load', function() {
	env = new Environment();
});

window.addEvent('keydown', function(e) { keyStates[e.key] = true; });
window.addEvent('keyup',   function(e) { delete keyStates[e.key]; });

function isColliding(obj1, obj2) {
	if(obj1.x + obj1.width < obj2.x)  return false; // If Obj1 is left  of Obj2
	if(obj1.x > obj2.x + obj2.width)  return false; // If Obj1 is right of Obj2
	if(obj1.y + obj1.height < obj2.y) return false; // If Obj1 is above of Obj2
	if(obj1.y > obj2.y + obj2.height) return false; // If Obj1 is below of Obj2

	return true;
}

