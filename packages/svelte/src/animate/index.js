/** @import { FlipParams, AnimationConfig } from './public.js' */
import { cubicOut } from '../easing/index.js';

/**
 * The flip function calculates the start and end position of an element and animates between them, translating the x and y values.
 * `flip` stands for [First, Last, Invert, Play](https://aerotwist.com/blog/flip-your-animations/).
 *
 * @param {Element} node
 * @param {{ from: DOMRect; to: DOMRect }} fromTo
 * @param {FlipParams} params
 * @returns {AnimationConfig}
 */
export function flip(node, { from, to }, params = {}) {
	var { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;

	var style = getComputedStyle(node);

	// find the transform origin, expressed as a pair of values between 0 and 1
	var transform = style.transform === 'none' ? '' : style.transform;
	var [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
	ox /= node.clientWidth;
	oy /= node.clientHeight;

	// calculate effect of parent transforms and zoom
	var zoom = get_zoom(node); // https://drafts.csswg.org/css-viewport/#effective-zoom
	var sx = node.clientWidth / to.width / zoom;
	var sy = node.clientHeight / to.height / zoom;

	// find the starting position of the transform origin
	var fx = from.left + from.width * ox;
	var fy = from.top + from.height * oy;

	// find the ending position of the transform origin
	var tx = to.left + to.width * ox;
	var ty = to.top + to.height * oy;

	// find the translation at the start of the transform
	var dx = (fx - tx) * sx;
	var dy = (fy - ty) * sy;

	// find the relative scale at the start of the transform
	var dsx = from.width / to.width;
	var dsy = from.height / to.height;

	return {
		delay,
		duration: typeof duration === 'function' ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
		easing,
		css: (t, u) => {
			var x = u * dx;
			var y = u * dy;
			var sx = t + u * dsx;
			var sy = t + u * dsy;

			return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
		}
	};
}

/**
 * @param {Element} element
 */
function get_zoom(element) {
	if ('currentCSSZoom' in element) {
		return /** @type {number} */ (element.currentCSSZoom);
	}

	/** @type {Element | null} */
	var current = element;
	var zoom = 1;

	while (current !== null) {
		zoom *= +getComputedStyle(current).zoom;
		current = /** @type {Element | null} */ (current.parentElement);
	}

	return zoom;
}
