import { cubicOut } from '../easing/index.mjs';
import { is_function } from '../internal/Component-cd97939e.mjs';

/**
 * @param {Element} node
 * @param {{ from: DOMRect; to: DOMRect }} fromTo
 * @param {import('./public.js').FlipParams} params
 * @returns {import('./public.js').AnimationConfig}
 */
function flip(node, { from, to }, params = {}) {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;
	const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
	const dx = from.left + (from.width * ox) / to.width - (to.left + ox);
	const dy = from.top + (from.height * oy) / to.height - (to.top + oy);
	const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
	return {
		delay,
		duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
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

export { flip };
