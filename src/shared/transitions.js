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
	var obj = fn( node, params );
	var duration = obj.duration || 300;
	var ease = obj.easing || linear;

	// TODO share <style> tag between all transitions?
	if ( obj.css ) {
		var style = document.createElement( 'style' );
	}

	if ( intro && obj.tick ) obj.tick( 0 );

	return {
		running: false,
		t: intro ? 0 : 1,
		pending: null,
		run: function ( intro, callback ) {
			var program = {
				intro: intro,
				start: window.performance.now() + ( obj.delay || 0 ),
				callback: callback
			};

			if ( obj.delay ) {
				this.pending = program;
			} else {
				this.start( program );
			}

			if ( !this.running ) {
				this.running = true;
				transitionManager.add( this );
			}
		},
		start: function ( program ) {
			program.a = this.t;
			program.b = program.intro ? 1 : 0;
			program.delta = program.b - program.a;
			program.duration = duration * Math.abs( program.b - program.a );
			program.end = program.start + program.duration;

			if ( obj.css ) {
				generateKeyframes( program.a, program.b, program.delta, program.duration, ease, obj.css, node, style );
			}

			this.program = program;
			this.pending = null;
		},
		update: function ( now ) {
			var program = this.program;
			if ( !program ) return;

			var p = now - program.start;
			this.t = program.a + program.delta * ease( p / program.duration );
			if ( obj.tick ) obj.tick( this.t );
		},
		done: function () {
			this.t = this.program.b;
			if ( obj.tick ) obj.tick( this.t );
			if ( obj.css ) document.head.removeChild( style );
			this.program.callback();
			this.program = null;
			this.running = !!this.pending;
		},
		abort: function () {
			if ( obj.tick ) obj.tick( 1 );
			if ( obj.css ) document.head.removeChild( style );
			this.program = null;
			this.running = !!this.pending;
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

			if ( transition.program && now >= transition.program.end ) {
				transition.done();
			}

			if ( transition.pending && now >= transition.pending.start ) {
				transition.start( transition.pending );
			}

			if ( transition.running ) {
				transition.update( now );
				transitionManager.running = true;
			} else if ( !transition.pending ) {
				transitionManager.transitions.splice( i, 1 );
			}
		}

		if ( transitionManager.running ) {
			requestAnimationFrame( transitionManager.next );
		}
	}
};