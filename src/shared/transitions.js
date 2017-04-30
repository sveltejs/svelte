import { assign, noop } from './utils.js';

export function linear ( t ) {
	return t;
}

export function wrapTransition ( node, fn, params, intro, outgroup ) {
	var obj = fn( node, params, intro );

	var duration = obj.duration || 300;
	var ease = obj.easing || linear;

	var transition = {
		start: null,
		end: null,
		a: null,
		b: null,
		d: null,
		running: false,
		t: intro ? 0 : 1,
		callback: null,
		run: function ( a, b, callback ) {
			this.a = a;
			this.b = b;
			this.d = b - a;
			this.start = window.performance.now() + ( obj.delay || 0 );
			this.duration = duration * Math.abs( b - a );
			this.end = this.start + this.duration;

			this.callback = callback;

			if ( !obj.tick ) this.generateKeyframes();

			if ( !this.running ) {
				this.running = true;
				transitionManager.add( this );
			}
		}
	}

	if ( obj.tick ) {
		// JS transition
		if ( intro ) obj.tick( 0 );

		return assign( transition, {
			update: function ( now ) {
				const p = now - this.start;
				this.t = this.a + this.d * ease( p / this.duration );
				obj.tick( this.t );
			},
			done: function () {
				obj.tick( intro ? 1 : 0 );
				this.callback();
			},
			abort: function () {
				if ( !intro ) obj.tick( 1 ); // reset styles for intro
				this.running = false;
			}
		});
	}

	// CSS transition
	var id = null;
	var style = document.createElement( 'style' );

	var cleanup = function () {
		if ( !transition.running ) return;
		document.head.removeChild( style );
		transition.running = false;
	};

	return assign( transition, {
		generateKeyframes: function () {
			id = 'svelte_' + ~~( Math.random() * 1e9 ); // TODO make this more robust
			var keyframes = '@keyframes ' + id + '{\n';

			for ( var p = 0; p <= 1; p += 166.666 / this.duration ) {
				var t = this.a + this.d * ease( p );
				var styles = obj.styles( ease( t ) );
				keyframes += ( p * 100 ) + '%{' + styles + '}\n';
			}

			keyframes += '100% {' + obj.styles( this.b ) + '}\n}';

			style.textContent += keyframes;
			document.head.appendChild( style );

			node.style.animation += ( node.style.animation ? ', ' : '' ) + id + ' ' + this.duration + 'ms linear 1 forwards';
		},
		update: function ( now ) {
			const p = now - this.start;
			this.t = this.a + this.d * ease( p / this.duration );
		},
		done: function () {
			this.callback();
			cleanup();
		},
		abort: function () {
			cleanup();
		}
	});
}

export var transitionManager = {
	running: false,
	transitions: [],

	add: function ( transition ) {
		transitionManager.transitions.push( transition );

		if ( !this.running ) {
			this.running = true;
			this.next();
		}
	},

	remove: function ( transitions ) {
		var i = transitions.length;
		while ( i-- ) {
			var index = this.transitions.indexOf( transitions[i] );
			if ( ~index ) this.transitions.splice( index, 1 );
		}
	},

	next: function () {
		transitionManager.running = false;

		var now = window.performance.now();
		var i = transitionManager.transitions.length;

		while ( i-- ) {
			var transition = transitionManager.transitions[i];

			if ( transition.running ) {
				if ( now >= transition.end ) {
					transition.running = false;
					transition.done();
				} else if ( now > transition.start ) {
					transition.update( now );
				}

				transitionManager.running = true;
			} else {
				transitionManager.transitions.splice( i, 1 );
			}
		}

		if ( transitionManager.running ) {
			requestAnimationFrame( transitionManager.next );
		}
	}
};