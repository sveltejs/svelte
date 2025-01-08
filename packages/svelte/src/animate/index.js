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
	var style = getComputedStyle(node);
	var zoom = get_zoom(node); // https://drafts.csswg.org/css-viewport/#effective-zoom

	var transform = style.transform === 'none' ? '' : style.transform;
	var [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
	var dsx = from.width / to.width;
	var dsy = from.height / to.height;

	ox /= node.clientWidth;
	oy /= node.clientHeight;

	var fromx = from.left + from.width * ox;
	var tox = to.left + to.width * ox;

	var fromy = from.top + from.height * oy;
	var toy = to.top + to.height * oy;

	var dx = ((fromx - tox) * (node.clientWidth / to.width)) / zoom;
	var dy = ((fromy - toy) * (node.clientHeight / to.height)) / zoom;
	var { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;

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
