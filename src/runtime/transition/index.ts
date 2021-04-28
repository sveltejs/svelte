import { cubicOut, cubicInOut, linear } from 'svelte/easing';
import { assign, is_function } from 'svelte/internal';

export type EasingFunction = (t: number) => number;

export interface TransitionConfig {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	css?: (t: number, u: number) => string;
	tick?: (t: number, u: number) => void;
}

export interface BlurParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	amount?: number;
	opacity?: number;
}

export function blur(node: Element, {
	delay = 0,
	duration = 400,
	easing = cubicInOut,
	amount = 5,
	opacity = 0
}: BlurParams = {}): TransitionConfig {
	const style = getComputedStyle(node);
	const target_opacity = +style.opacity;
	const f = style.filter === 'none' ? '' : style.filter;

	const od = target_opacity * (1 - opacity);

	return {
		delay,
		duration,
		easing,
		css: (_t, u) => `opacity: ${target_opacity - (od * u)}; filter: ${f} blur(${u * amount}px);`
	};
}

export interface FadeParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
}

export function fade(node: Element, {
	delay = 0,
	duration = 400,
	easing = linear
}: FadeParams = {}): TransitionConfig {
	const o = +getComputedStyle(node).opacity;

	return {
		delay,
		duration,
		easing,
		css: t => `opacity: ${t * o}`
	};
}

export interface FlyParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	x?: number;
	y?: number;
	opacity?: number;
}

export function fly(node: Element, {
	delay = 0,
	duration = 400,
	easing = cubicOut,
	x = 0,
	y = 0,
	opacity = 0
}: FlyParams = {}): TransitionConfig {
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

export interface SlideParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	axis?: 'x' | 'y';
}

export function slide(node: Element, {
	delay = 0,
	duration = 400,
	easing = cubicOut,
	axis = 'y'
}: SlideParams = {}): TransitionConfig {
	const style = getComputedStyle(node);
	const opacity = +style.opacity;
	const primary_dimension = axis === 'y' ? 'height' : 'width';
	const primary_dimension_value = parseFloat(style[primary_dimension]);
	const secondary_dimensions = axis === 'y' ? ['Top', 'Bottom'] : ['Left', 'Right'];
	const padding_first_value = parseFloat(style.padding + secondary_dimensions[0]);
	const padding_second_value = parseFloat(style.padding + secondary_dimensions[1]);
	const margin_first_value = parseFloat(style.margin + secondary_dimensions[0]);
	const margin_second_value = parseFloat(style.margin + secondary_dimensions[1]);
	const border_width_first_value = parseFloat(style['border'.concat(secondary_dimensions[0].concat('Width'))]);
	const border_width_second_value = parseFloat(style[`border${secondary_dimensions[1]}Width`]);
	return {
		delay,
		duration,
		easing,
		css: t =>
			'overflow: hidden;' +
			`opacity: ${Math.min(t * 20, 1) * opacity};` +
			`${primary_dimension}: ${t * primary_dimension_value}px;` +
			`padding-${secondary_dimensions[0].toLowerCase()}: ${t * padding_first_value}px;` +
			`padding-${secondary_dimensions[1].toLowerCase()}: ${t * padding_second_value}px;` +
			`margin-${secondary_dimensions[0].toLowerCase()}: ${t * margin_first_value}px;` +
			`margin-${secondary_dimensions[1].toLowerCase()}: ${t * margin_second_value}px;` +
			`border-${secondary_dimensions[0].toLowerCase()}-width: ${t * border_width_first_value}px;` +
			`border-${secondary_dimensions[1].toLowerCase()}-width: ${t * border_width_second_value}px;`
	};
}

export interface ScaleParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	start?: number;
	opacity?: number;
}

export function scale(node: Element, {
	delay = 0,
	duration = 400,
	easing = cubicOut,
	start = 0,
	opacity = 0
}: ScaleParams = {}): TransitionConfig {
	const style = getComputedStyle(node);
	const target_opacity = +style.opacity;
	const transform = style.transform === 'none' ? '' : style.transform;

	const sd = 1 - start;
	const od = target_opacity * (1 - opacity);

	return {
		delay,
		duration,
		easing,
		css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
	};
}

export interface DrawParams {
	delay?: number;
	speed?: number;
	duration?: number | ((len: number) => number);
	easing?: EasingFunction;
}

export function draw(node: SVGElement & { getTotalLength(): number }, {
	delay = 0,
	speed,
	duration,
	easing = cubicInOut
}: DrawParams = {}): TransitionConfig {
	let len = node.getTotalLength();
	const style = getComputedStyle(node);
	if (style.strokeLinecap !== 'butt') {
		len += parseInt(style.strokeWidth);
	}

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
		css: (_, u) => `
			stroke-dasharray: ${len};
			stroke-dashoffset: ${u * len};
		`
	};
}

export interface CrossfadeParams {
	delay?: number;
	duration?: number | ((len: number) => number);
	easing?: EasingFunction;
}

type ClientRectMap = Map<any, Element>;

export function crossfade({ fallback, ...defaults }: CrossfadeParams & {
	fallback?: (node: Element, params: CrossfadeParams, intro: boolean) => TransitionConfig;
}): [
  (
    node: Element,
    params: CrossfadeParams & {
      key: any;
    }
  ) => () => TransitionConfig,
  (
    node: Element,
    params: CrossfadeParams & {
      key: any;
    }
  ) => () => TransitionConfig
] {
	const to_receive: ClientRectMap = new Map();
	const to_send: ClientRectMap = new Map();

	function crossfade(from_node: Element, node: Element, params: CrossfadeParams): TransitionConfig {
		const {
			delay = 0,
			duration = d => Math.sqrt(d) * 30,
			easing = cubicOut
		} = assign(assign({}, defaults), params);

		const from = from_node.getBoundingClientRect();
		const to = node.getBoundingClientRect();
		const dx = from.left - to.left;
		const dy = from.top - to.top;
		const dw = from.width / to.width;
		const dh = from.height / to.height;
		const d = Math.sqrt(dx * dx + dy * dy);

		const style = getComputedStyle(node);
		const transform = style.transform === 'none' ? '' : style.transform;
		const opacity = +style.opacity;

		return {
			delay,
			duration: is_function(duration) ? duration(d) : duration,
			easing,
			css: (t, u) => `
				opacity: ${t * opacity};
				transform-origin: top left;
				transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${t + (1 - t) * dh});
			`
		};
	}

	function transition(items: ClientRectMap, counterparts: ClientRectMap, intro: boolean) {
		return (node: Element, params: CrossfadeParams & { key: any }) => {
			items.set(params.key, node);

			return () => {
				if (counterparts.has(params.key)) {
					const other_node = counterparts.get(params.key);
					counterparts.delete(params.key);

					return crossfade(other_node, node, params);
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
