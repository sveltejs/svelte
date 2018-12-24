import { cubicOut } from 'svelte/easing';

export function expand(node, params) {
	const {
		delay = 0,
		duration = 400,
		easing = cubicOut
	} = params;

	const w = parseFloat(getComputedStyle(node).strokeWidth);

	return {
		delay,
		duration,
		easing,
		css: t => `opacity: ${t}; stroke-width: ${t * w}`
	};
}

export function blur(node, params) {
	const {
		b = 10,
		delay = 0,
		duration = 400,
		easing = cubicOut
	} = params;

	return {
		delay,
		duration,
		easing,
		css: (t, u) => `opacity: ${t}; filter: blur(${u * b}px);`
	};
}