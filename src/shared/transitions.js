import { noop } from './utils.js';

export function linear ( t ) {
	return t;
}

export function wrapTransition ( node, fn, params, isIntro ) {
	var obj = fn( node, params, isIntro );

	var start = window.performance.now() + ( obj.delay || 0 );
	var duration = obj.duration || 300;
	var end = start + duration;
	var ease = obj.easing || linear;

	if ( obj.tick ) {
		// JS transition
		if ( isIntro ) obj.tick( 0 );

		return {
			start: start,
			end: end,
			update: function ( now ) {
				obj.tick( ease( ( now - start ) / duration ) );
			},
			done: function () {
				obj.tick( isIntro ? 1 : 0 );
			},
			abort: noop
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
					node.style[ key ] = isIntro ? obj.styles[ key ] : computedStyles[ key ];
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
						node.style[ key ] = isIntro ? computedStyles[ key ] : obj.styles[ key ];
					}

					started = true;
				}
			},
			done: function () {
				// TODO what if one of these styles was dynamic?
				if ( isIntro ) {
					for ( var key in obj.styles ) {
						node.style[ key ] = inlineStyles[ key ];
					}
				}
			},
			abort: function () {
				node.style.cssText = getComputedStyle( node ).cssText;
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
			if ( now >= transition.end ) {
				transition.done();
				transitionManager.transitions.splice( i, 1 );
			} else {
				if ( now > transition.start ) transition.update( now );
				transitionManager.running = true;
			}
		}

		if ( transitionManager.running ) {
			requestAnimationFrame( transitionManager.next );
		}
	}
};