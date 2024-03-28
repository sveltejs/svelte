import { cubicOut } from '../easing/index.js';

/**
 * The flip function calculates the start and end position of an element and animates between them, translating the x and y values.
 * `flip` stands for [First, Last, Invert, Play](https://aerotwist.com/blog/flip-your-animations/).
 *
 * https://svelte.dev/docs/svelte-animate#flip
 * @param {Element} node
 * @param {{ from: DOMRect; to: DOMRect }} fromTo
 * @param {import('./public.js').FlipParams} params
 * @returns {import('./public.js').AnimationConfig}
 */
export function flip(node, { from, to }, params = {}) {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;
	const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
	const dx = from.left + (from.width * ox) / to.width - (to.left + ox);
	const dy = from.top + (from.height * oy) / to.height - (to.top + oy);
	const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
	return {
		delay,
		duration: typeof duration === 'function' ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
		easing,
		css: (t, u) => {
			const x = u * dx;
			const y = u * dy;
			const sx = t + (u * from.width) / to.width;
			const sy = t + (u * from.height) / to.height;
			return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
		}
	};
}
