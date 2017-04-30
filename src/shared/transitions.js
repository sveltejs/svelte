import { noop } from './utils.js';

export function linear ( t ) {
	return t;
}

export function wrapTransition ( node, fn, params, intro, outgroup ) {
	var obj = fn( node, params, intro );

	var duration = obj.duration || 300;
	var ease = obj.easing || linear;

	if ( obj.tick ) {
		// JS transition
		if ( intro ) obj.tick( 0 );

		return {
			start: null,
			end: null,
			a: null,
			d: null,
			running: false,
			t: intro ? 0 : 1,
			callback: null,
			update: function ( now ) {
				const p = now - this.start;
				this.t = this.a + this.d * ease( p / this.duration );
				obj.tick( this.t );
			},
			done: function () {
				obj.tick( intro ? 1 : 0 );
				this.callback();
				this.running = false;
			},
			abort: function () {
				if ( !intro ) obj.tick( 1 ); // reset styles for intro
				this.running = false;
			},
			run: function ( a, b, callback ) {
				this.a = a;
				this.d = b - a;
				this.start = window.performance.now() + ( obj.delay || 0 );
				this.duration = duration * Math.abs( b - a );
				this.end = this.start + this.duration;

				this.callback = callback;

				if ( !this.running ) {
					this.running = true;
					transitionManager.add( this );
				}
			}
		};
	} else {
		// CSS transition
		var started = false;
		var inlineStyles = {};
		var computedStyles = getComputedStyle( node );

		return {
			start: start,
			end: end,
			init: function () {
				for ( var key in obj.styles ) {
					inlineStyles[ key ] = node.style[ key ];
					node.style[ key ] = intro ? obj.styles[ key ] : computedStyles[ key ];
				}
			},
			update: function ( now ) {
				if ( !started ) {
					var keys = Object.keys( obj.styles );
					div.style.transition = keys.map( function ( key ) {
						return key + ' ' + d;
					}).join( ', ' );

					// TODO use a keyframe animation for custom easing functions

					for ( var key in obj.styles ) {
						node.style[ key ] = intro ? computedStyles[ key ] : obj.styles[ key ];
					}

					started = true;
				}
			},
			done: function () {
				// TODO what if one of these styles was dynamic?
				if ( intro ) {
					for ( var key in obj.styles ) {
						node.style[ key ] = inlineStyles[ key ];
					}
				}
				callback();
			},
			abort: function () {
				node.style.cssText = getComputedStyle( node ).cssText;
				this.aborted = true;
			},
			run: function ( a, b, callback ) {
				// TODO...
			}
		};
	}
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
					transition.done();
				} else if ( now > transition.start ) {
					transition.update( now );
				}
			}

			if ( transition.running ) {
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