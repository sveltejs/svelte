import { assign, noop } from './utils.js';

export function linear ( t ) {
	return t;
}

export function generateKeyframes ( a, b, delta, duration, ease, fn, node, style ) {
	var id = '__svelte' + ~~( Math.random() * 1e9 ); // TODO make this more robust
	var keyframes = '@keyframes ' + id + '{\n';

	for ( var p = 0; p <= 1; p += 16.666 / duration ) {
		var t = a + delta * ease( p );
		keyframes += ( p * 100 ) + '%{' + fn( t ) + '}\n';
	}

	keyframes += '100% {' + fn( b ) + '}\n}';
	style.textContent += keyframes;

	document.head.appendChild( style );

	node.style.animation = node.style.animation.split( ',' )
		.filter( function ( anim ) {
			// when introing, discard old animations if there are any
			return anim && ( delta < 0 || !/__svelte/.test( anim ) );
		})
		.concat( id + ' ' + duration + 'ms linear 1 forwards' )
		.join( ', ' );
}

export function wrapTransition ( node, fn, params, intro, outgroup ) {
	var obj = fn( node, params, intro );
	var duration = obj.duration || 300;
	var ease = obj.easing || linear;

	// TODO share <style> tag between all transitions?
	if ( obj.css ) {
		var style = document.createElement( 'style' );
	}

	if ( intro && obj.tick ) obj.tick( 0 );

	return {
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
			this.delta = b - a;
			this.start = window.performance.now() + ( obj.delay || 0 );
			this.duration = duration * Math.abs( b - a );
			this.end = this.start + this.duration;

			this.callback = callback;

			if ( obj.css ) {
				generateKeyframes( this.a, this.b, this.delta, this.duration, ease, obj.css, node, style );
			}

			if ( !this.running ) {
				this.running = true;
				transitionManager.add( this );
			}
		},
		update: function ( now ) {
			var p = now - this.start;
			this.t = this.a + this.delta * ease( p / this.duration );
			if ( obj.tick ) obj.tick( this.t );
		},
		done: function () {
			if ( obj.tick ) obj.tick( intro ? 1 : 0 );
			if ( obj.css ) document.head.removeChild( style );
			this.callback();
			this.running = false;
		},
		abort: function () {
			if ( obj.tick ) obj.tick( 1 );
			if ( obj.css ) document.head.removeChild( style );
			this.running = false;
		}
	};
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