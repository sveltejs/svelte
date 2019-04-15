import { cubicOut } from './easing';
import { is_function } from './internal';

export function flip(node, animation, params) {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const dx = animation.from.left - animation.to.left;
	const dy = animation.from.top - animation.to.top;

	const d = Math.sqrt(dx * dx + dy * dy);

	const {
		delay = 0,
		duration = d => Math.sqrt(d) * 120,
		easing = cubicOut
	} = params;

	return {
		delay,
		duration: is_function(duration) ? duration(d) : duration,
		easing,
		css: (t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
	};
}