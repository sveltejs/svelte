import { noop } from './utils.js';

export function linear ( t ) {
	return t;
}

export function wrapTransition ( node, fn, params, intro, outgroup, callback ) {
	var obj = fn( node, params, intro );

	var start = window.performance.now() + ( obj.delay || 0 );
	var duration = obj.duration || 300;
	var end = start + duration;
	var ease = obj.easing || linear;

	if ( obj.tick ) {
		// JS transition
		if ( intro ) obj.tick( 0 );

		return {
			start: start,
			end: end,
			update: function ( now ) {
				const p = intro ? now - start : end - now;
				obj.tick( ease( p / duration ) );
			},
			done: function () {
				obj.tick( intro ? 1 : 0 );
				callback();
			},
			abort: function () {
				if ( !intro ) obj.tick( 1 ); // reset styles for intro
				this.aborted = true;
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

			if ( now < transition.end && !transition.aborted ) {
				if ( now > transition.start ) transition.update( now );
				transitionManager.running = true;
			} else {
				if ( !transition.aborted ) transition.done();
				transitionManager.transitions.splice( i, 1 );
			}
		}

		if ( transitionManager.running ) {
			requestAnimationFrame( transitionManager.next );
		}
	}
};