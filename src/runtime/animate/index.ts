import { cubicOut } from 'svelte/easing';
import { is_function } from 'svelte/internal';

// todo: same as Transition, should it be shared?
export interface AnimationConfig {
	delay?: number;
	duration?: number;
	easing?: (t: number) => number;
	css?: (t: number, u: number) => string;
	tick?: (t: number, u: number) => void;
}

export interface FlipParams {
	delay?: number;
	duration?: number | ((len: number) => number);
	easing?: (t: number) => number;
}

export function flip(node: Element, { from, to }: { from: DOMRect; to: DOMRect }, params: FlipParams = {}): AnimationConfig {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
	const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
	const dy = (from.top + from.height * oy / to.height) - (to.top + oy);

	const {
		delay = 0,
		duration = (d) => Math.sqrt(d) * 120,
		easing = cubicOut
	} = params;

	return {
		delay,
		duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
		easing,
		css: (t, u) => {
			const x = u * dx;
			const y = u * dy;
			const sx = t + u * from.width / to.width;
			const sy = t + u * from.height / to.height;

			return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
		}
	};
}
