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

	var dx = (from.left + dsx * ox - (to.left + ox)) / zoom;
	var dy = (from.top + dsy * oy - (to.top + oy)) / zoom;
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
			return `transform: ${transform} scale(${sx}, ${sy}) translate(${x}px, ${y}px);`;
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
