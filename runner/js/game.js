
'use strict';

var env, keyStates = {};

window.addEvent('load', function() {
	env = new Environment();
});

window.addEvent('keydown', function(e) { keyStates[e.key] = true; });
window.addEvent('keyup',   function(e) { delete keyStates[e.key]; });

