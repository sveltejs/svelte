import { cubicOut, cubicInOut } from './easing';
import { assign, is_function } from './internal';

export function fade(node, {
	delay = 0,
	duration = 400
}) {
	const o = +getComputedStyle(node).opacity;

	return {
		delay,
		duration,
		css: t => `opacity: ${t * o}`
	};
}

export function fly(node, {
	delay = 0,
	duration = 400,
	easing = cubicOut,
	x = 0,
	y = 0
}) {
	const style = getComputedStyle(node);
	const opacity = +style.opacity;
	const transform = style.transform === 'none' ? '' : style.transform;

	return {
		delay,
		duration,
		easing,
		css: t => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${t * opacity}`
	};
}

export function slide(node, {
	delay = 0,
	duration = 400,
	easing = cubicOut
}) {
	const style = getComputedStyle(node);
	const opacity = +style.opacity;
	const height = parseFloat(style.height);
	const padding_top = parseFloat(style.paddingTop);
	const padding_bottom = parseFloat(style.paddingBottom);
	const margin_top = parseFloat(style.marginTop);
	const margin_bottom = parseFloat(style.marginBottom);
	const border_top_width = parseFloat(style.borderTopWidth);
	const border_bottom_width = parseFloat(style.borderBottomWidth);

	return {
		delay,
		duration,
		easing,
		css: t =>
			`overflow: hidden;` +
			`opacity: ${Math.min(t * 20, 1) * opacity};` +
			`height: ${t * height}px;` +
			`padding-top: ${t * padding_top}px;` +
			`padding-bottom: ${t * padding_bottom}px;` +
			`margin-top: ${t * margin_top}px;` +
			`margin-bottom: ${t * margin_bottom}px;` +
			`border-top-width: ${t * border_top_width}px;` +
			`border-bottom-width: ${t * border_bottom_width}px;`
	};
}

export function draw(node, {
	delay = 0,
	duration = 800,
	easing = cubicInOut
}) {
	const len = node.getTotalLength();

	return {
		delay,
		duration,
		easing,
		css: (t, u) => `stroke-dasharray: ${t * len} ${u * len}`
	};
}

export function crossfade({ fallback, ...defaults }) {
	let to_receive = new Map();
	let to_send = new Map();

	function crossfade(from, node, params) {
		const {
			delay = 0,
			duration = d => Math.sqrt(d) * 30,
			easing = cubicOut
		} = assign(assign({}, defaults), params);

		const to = node.getBoundingClientRect();
		const dx = from.left - to.left;
		const dy = from.top - to.top;

		const style = getComputedStyle(node);
		const transform = style.transform === 'none' ? '' : style.transform;

		return {
			delay,
			duration: is_function(duration) ? duration(d) : duration,
			easing,
			css: (t, u) => `
				opacity: ${t};
				transform: ${transform} translate(${u * dx}px,${u * dy}px);
			`
		};
	}

	function transition(items, counterparts, intro) {
		return (node, params) => {
			items.set(params.key, {
				rect: node.getBoundingClientRect()
			});

			return () => {
				if (counterparts.has(params.key)) {
					const { rect } = counterparts.get(params.key);
					counterparts.delete(params.key);

					return crossfade(rect, node, params);
				}

				// if the node is disappearing altogether
				// (i.e. wasn't claimed by the other list)
				// then we need to supply an outro
				items.delete(params.key);
				return fallback && fallback(node, params, intro);
			};
		};
	}

	return [
		transition(to_send, to_receive, false),
		transition(to_receive, to_send, true)
	];
}