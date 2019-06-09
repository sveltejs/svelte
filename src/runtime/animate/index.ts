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

interface FlipParams {
	delay: number;
	duration: number | ((len: number) => number);
	easing: (t: number) => number;
}

export function flip(node: Element, animation: { from: DOMRect; to: DOMRect }, params: FlipParams): AnimationConfig {
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
		css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
	};
}
