/** @import { FlipParams, AnimationConfig } from './public.js' */
import { cubicOut } from '../easing/index.js';

/**
 * The flip function calculates the start and end position of an element and animates between them, translating the x and y values.
 * `flip` stands for [First, Last, Invert, Play](https://aerotwist.com/blog/flip-your-animations/).
 *
 * https://svelte.dev/docs/svelte-animate#flip
 * @param {Element} node
 * @param {{ from: DOMRect; to: DOMRect }} fromTo
 * @param {FlipParams} params
 * @returns {AnimationConfig}
 */
export function flip(node, { from, to }, params = {}) {
	const style = getComputedStyle(node);

	const zoom = from.width / parseFloat(style.width); // https://drafts.csswg.org/css-viewport/#effective-zoom
	const transform = style.transform === 'none' ? '' : style.transform;
	const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
	const dsx = from.width / to.width;
	const dsy = from.height / to.height;
	const dx = (from.left + dsx * ox - (to.left + ox)) / zoom;
	const dy = (from.top + dsy * oy - (to.top + oy)) / zoom;
	const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;

	return {
		delay,
		duration: typeof duration === 'function' ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
		easing,
		css: (t, u) => {
			const x = u * dx;
			const y = u * dy;
			const sx = t + u * dsx;
			const sy = t + u * dsy;
			return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
		}
	};
}
