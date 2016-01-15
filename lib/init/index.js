//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/**
 * Pixelbox main framework module
 * 
 * @author Cedric Stoquer
 */

var assetLoader  = require('assetLoader');
var AudioManager = require('audio-manager');

var PIXEL_SIZE = 4;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// audio

var audioManager = window.audioManager = new AudioManager(['sfx']);
audioManager.settings.audioPath = 'audio/';
audioManager.settings.defaultFade = 0.3;

window.sfx = function (soundId, volume, panoramic, pitch) {
	audioManager.playSound('sfx', soundId, volume, panoramic, pitch);
};

window.music = function (soundId, volume) {
	if (!soundId) {
		audioManager.stopLoopSound('sfx');
		return;
	}
	audioManager.playLoopSound('sfx', soundId, volume);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// controls

var button   = window.button   = { up: false, down: false, left: false, right: false, A: false, B: false };
var bpress   = window.bpress   = { up: false, down: false, left: false, right: false, A: false, B: false };
var brelease = window.brelease = { up: false, down: false, left: false, right: false, A: false, B: false };

function resetControlTriggers() {
	bpress.up      = false;
	bpress.down    = false;
	bpress.left    = false;
	bpress.right   = false;
	bpress.A       = false;
	bpress.B       = false;
	brelease.up    = false;
	brelease.down  = false;
	brelease.left  = false;
	brelease.right = false;
	brelease.A     = false;
	brelease.B     = false;
}

var keyMap = {
	37: 'left',
	38: 'up',
	39: 'right',
	40: 'down',
	32: 'A',
	81: 'B'
};

function keyChange(keyCode, isPressed) {
	var key = keyMap[keyCode];
	if (!key) return;
	if ( isPressed && !button[key])   bpress[key] = true;
	if (!isPressed &&  button[key]) brelease[key] = true;
	button[key] = isPressed;
}

window.addEventListener('keydown', function onKeyPressed(e) { keyChange(e.keyCode, true);  });
window.addEventListener('keyup',   function onKeyRelease(e) { keyChange(e.keyCode, false); });


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// Texture

function createCanvas(w, h) {
	var canvas = document.createElement('canvas');
	canvas.width  = w;
	canvas.height = h;
	return canvas;
}

function Texture(w, h) {
	this.canvas = createCanvas(w, h);
	this.ctx = this.canvas.getContext('2d');
	this.ctx.fillStyle = '#000';
	this.cursor = { i: 0, j: 0 };
	this.pen = 0;
	// TODO camera offset
}

window.texture = function (img) {
	var texture = new Texture(img.width, img.height);
	texture.ctx.drawImage(img, 0, 0);
	return texture;
}

var currentCharset = new Texture(128, 128);
var textCharset    = new Texture(128 * 3, 5 * 16);

Texture.prototype.sprite = function (sprite, x, y, flipH, flipV) {
	var sx = sprite % 16;
	var sy = ~~(sprite / 16);
	this.ctx.drawImage(currentCharset, sx * 8, sy * 8, 8, 8, ~~x, ~~y, 8, 8);
};

Texture.prototype.blit = function (texture, x, y) {
	this.ctx.drawImage(texture.canvas, ~~x, ~~y);
};

Texture.prototype.clear = function () {
	this.ctx.clearRect(0, 0, 128, 128);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// text

Texture.prototype.locate = function (i, j) {
	this.cursor.i = ~~i;
	this.cursor.j = ~~j;
};

Texture.prototype.print = function (str, x, y) {
	if (x !== undefined) {
		x = ~~x;
		y = ~~y;
		for (var i = 0; i < str.length; i++) {
			this.ctx.drawImage(
				textCharset.canvas,
				3 * str.charCodeAt(i),
				5 * this.pen,
				3, 5,
				x, y,
				3, 5
			);
			x += 4;
		}
		return;
	}
	for (var i = 0; i < str.length; i++) {
		//sprite(str.charCodeAt(i), this.cursor.i * 4, this.cursor.j * 6);
		this.ctx.drawImage(
			textCharset.canvas,
			3 * str.charCodeAt(i),
			5 * this.pen,
			3, 5,
			this.cursor.i * 4,
			this.cursor.j * 6,
			3, 5
		);
		this.cursor.i += 1;
		if (this.cursor.i > 32) {
			this.cursor.i = 0;
			this.cursor.j += 1;
			// TODO vertical scrolling
		}
	}
};

window.Texture = Texture;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// screen

function createScreen() {
	var texture = new Texture(128, 128);
	var canvas = texture.canvas;
	document.body.appendChild(canvas);
	var style = canvas.style;
	style.width  = 128 * PIXEL_SIZE + 'px';
	style.height = 128 * PIXEL_SIZE + 'px';
	return texture;
}

var screen = window.$screen = createScreen();

window.cls = function () {
	screen.ctx.fillRect(0, 0, 128, 128);
};

window.sprite = function (sprite, x, y, flipH, flipV) {
	screen.sprite(sprite, x, y, flipH, flipV);
};

window.charset = function(img) {
	// TODO: clear and draw
	currentCharset = img;
};

window.locate = function (i, j) {
	screen.locate(i, j);
};

window.print = function (str, x, y) {
	screen.print(str, x, y);
};

window.pen = function (p) {
	screen.pen = p;
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// text charset generation

function getTextCharcodes(t) {
	var canvas = t.canvas;
	var ctx = t.ctx;
	var charcodes = [];
	for (var chr = 0; chr < 128; chr++) {
		var imageData = ctx.getImageData(chr * 3, 0, 3, 5);
		var pixels = imageData.data;
		var code = 0;
		var bit = 0;
		for (var i = 0, len = pixels.length; i < len; i += 4) {
			var pixel = pixels[i]; // only the first pixel is enough
			if (pixel > 0) {
				code += 1 << bit;
			}
			bit += 1;
		}
		charcodes.push(code);
	}

	return charcodes;
}

function generateTextCharset() {
	var colors = [
		'#000000',
		'#1D2B53',
		'#008751',
		'#AB5236',
		'#7E2553',
		'#5F574F',
		'#29ADFF',
		'#00E756',
		'#FFA300',
		'#FF77A8',
		'#C2C3C7',
		'#83769C',
		'#FFFF27',
		'#FFCCAA',
		'#FFF1E8',
		'#FF004D'
	];

	var codes = [
		219,438,511,14016,14043,14326,14335,28032,28123,28086,28159,32704,32731,
		32758,32767,128,146,384,402,9344,9362,9600,9618,192,210,448,466,9408,9426,
		9664,9682,32767,0,8338,45,11962,5588,21157,29354,10,17556,5265,21973,1488,
		5312,448,13824,5268,31599,29843,29671,31143,18925,31183,31689,18735,31727,
		18927,1040,5136,17492,3640,5393,8359,25450,23530,31467,25166,15211,29391,
		4815,27470,23533,29847,15142,23277,29257,23421,23403,11114,4843,26474,
		23279,14798,9367,27501,12141,24429,23213,14829,29351,25750,17553,13459,
		9402,28672,34,23530,31467,25166,15211,29391,4815,27470,23533,29847,15142,
		23277,29257,23421,23403,11114,4843,26474,23279,14798,9367,27501,12141,
		24429,23213,14829,29351,25686,9362,13587,42,21845
	];

	var ctx = textCharset.ctx;

	for (var pen = 0; pen < 16; pen++) {
		ctx.fillStyle = colors[pen];
		for (var i = 0; i < codes.length; i++) {
			var code = codes[i];
			for (var bit = 0; bit < 15; bit++) {
				var x = bit % 3;
				var y = ~~(bit / 3);
				var pixel = (code >> bit) & 1;
				if (pixel !== 1) continue;
				ctx.fillRect(i * 3 + x, pen * 5 + y, 1, 1);
			}
		}
	}
	ctx.fillStyle = '#000';
}

generateTextCharset();

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// main

var FRAME_INTERVAL = 1 / 60;

var requestAnimationFrame = 
	window.requestAnimationFrame       ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame    ||
	window.oRequestAnimationFrame      ||
	window.msRequestAnimationFrame     ||
	function nextFrame(callback) { window.setTimeout(callback, FRAME_INTERVAL); };


function onAssetsLoaded(error, assets) {
	cls();
	pen(14);
	locate();

	if (error) {
		locate();
		print(error);
		return console.error(error);
	}

	window.assets = assets;
	charset(assets.charset);

	var main = require('../src/main.js');

	if (!main.update) return;

	function update() {
		// TODO TINA
		main.update();
		resetControlTriggers();
		requestAnimationFrame(update);
	}

	resetControlTriggers();
	update();
}

function showProgress(load, current, count) {
	// console.log(load, current, count);
	// TODO
}

cls();
assetLoader.preloadStaticAssets(onAssetsLoaded, showProgress);