import { cubicOut, cubicInOut } from './easing';

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
	y = 0,
	opacity = 0
}) {
	const style = getComputedStyle(node);
	const target_opacity = +style.opacity;
	const transform = style.transform === 'none' ? '' : style.transform;

	const od = target_opacity * (1 - opacity);

	return {
		delay,
		duration,
		easing,
		css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
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

export function scale(node, {
	delay = 0,
	duration = 400,
	easing = cubicOut,
	start = 0,
	opacity = 0
}) {
	const style = getComputedStyle(node);
	const target_opacity = +style.opacity;
	const transform = style.transform === 'none' ? '' : style.transform;

	const sd = 1 - start;
	const od = target_opacity * (1 - opacity);

	return {
		delay,
		duration,
		easing,
		css: (t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
	};
}

export function draw(node, {
	delay = 0,
	speed,
	duration,
	easing = cubicInOut
}) {
	const len = node.getTotalLength();

	if (duration === undefined) {
		if (speed === undefined) {
			duration = 800;
		} else {
			duration = len / speed;
		}
	} else if (typeof duration === 'function') {
		duration = duration(len);
	}

	return {
		delay,
		duration,
		easing,
		css: (t, u) => `stroke-dasharray: ${t * len} ${u * len}`
	};
}