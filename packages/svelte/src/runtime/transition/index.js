import { cubicOut, cubicInOut, linear } from '../easing/index.js';
import { assign, split_css_unit, is_function } from '../internal/index.js';

/**
 * Animates a `blur` filter alongside an element's opacity.
 *
 * https://svelte.dev/docs/svelte-transition#blur
 * @param {Element} node
 * @param {import('./public').BlurParams} [params]
 * @returns {import('./public').TransitionConfig}
 */
export function blur(
	node,
	{ delay = 0, duration = 400, easing = cubicInOut, amount = 5, opacity = 0 } = {}
) {
	const style = getComputedStyle(node);
	const target_opacity = +style.opacity;
	const f = style.filter === 'none' ? '' : style.filter;
	const od = target_opacity * (1 - opacity);
	const [value, unit] = split_css_unit(amount);
	return {
		delay,
		duration,
		easing,
		css: (_t, u) => `opacity: ${target_opacity - od * u}; filter: ${f} blur(${u * value}${unit});`
	};
}

/**
 * Animates the opacity of an element from 0 to the current opacity for `in` transitions and from the current opacity to 0 for `out` transitions.
 *
 * https://svelte.dev/docs/svelte-transition#fade
 * @param {Element} node
 * @param {import('./public').FadeParams} [params]
 * @returns {import('./public').TransitionConfig}
 */
export function fade(node, { delay = 0, duration = 400, easing = linear } = {}) {
	const o = +getComputedStyle(node).opacity;
	return {
		delay,
		duration,
		easing,
		css: (t) => `opacity: ${t * o}`
	};
}

/**
 * Animates the x and y positions and the opacity of an element. `in` transitions animate from the provided values, passed as parameters to the element's default values. `out` transitions animate from the element's default values to the provided values.
 *
 * https://svelte.dev/docs/svelte-transition#fly
 * @param {Element} node
 * @param {import('./public').FlyParams} [params]
 * @returns {import('./public').TransitionConfig}
 */
export function fly(
	node,
	{ delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}
) {
	const style = getComputedStyle(node);
	const target_opacity = +style.opacity;
	const transform = style.transform === 'none' ? '' : style.transform;
	const od = target_opacity * (1 - opacity);
	const [xValue, xUnit] = split_css_unit(x);
	const [yValue, yUnit] = split_css_unit(y);
	return {
		delay,
		duration,
		easing,
		css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * xValue}${xUnit}, ${(1 - t) * yValue}${yUnit});
			opacity: ${target_opacity - od * u}`
	};
}

/**
 * Slides an element in and out.
 *
 * https://svelte.dev/docs/svelte-transition#slide
 * @param {Element} node
 * @param {import('./public').SlideParams} [params]
 * @returns {import('./public').TransitionConfig}
 */
export function slide(node, { delay = 0, duration = 400, easing = cubicOut, axis = 'y' } = {}) {
	const style = getComputedStyle(node);
	const opacity = +style.opacity;
	const primary_property = axis === 'y' ? 'height' : 'width';
	const primary_property_value = parseFloat(style[primary_property]);
	const secondary_properties = axis === 'y' ? ['top', 'bottom'] : ['left', 'right'];
	const capitalized_secondary_properties = secondary_properties.map(
		(e) => `${e[0].toUpperCase()}${e.slice(1)}`
	);
	const padding_start_value = parseFloat(style[`padding${capitalized_secondary_properties[0]}`]);
	const padding_end_value = parseFloat(style[`padding${capitalized_secondary_properties[1]}`]);
	const margin_start_value = parseFloat(style[`margin${capitalized_secondary_properties[0]}`]);
	const margin_end_value = parseFloat(style[`margin${capitalized_secondary_properties[1]}`]);
	const border_width_start_value = parseFloat(
		style[`border${capitalized_secondary_properties[0]}Width`]
	);
	const border_width_end_value = parseFloat(
		style[`border${capitalized_secondary_properties[1]}Width`]
	);
	return {
		delay,
		duration,
		easing,
		css: (t) =>
			'overflow: hidden;' +
			`opacity: ${Math.min(t * 20, 1) * opacity};` +
			`${primary_property}: ${t * primary_property_value}px;` +
			`padding-${secondary_properties[0]}: ${t * padding_start_value}px;` +
			`padding-${secondary_properties[1]}: ${t * padding_end_value}px;` +
			`margin-${secondary_properties[0]}: ${t * margin_start_value}px;` +
			`margin-${secondary_properties[1]}: ${t * margin_end_value}px;` +
			`border-${secondary_properties[0]}-width: ${t * border_width_start_value}px;` +
			`border-${secondary_properties[1]}-width: ${t * border_width_end_value}px;`
	};
}

/**
 * Animates the opacity and scale of an element. `in` transitions animate from an element's current (default) values to the provided values, passed as parameters. `out` transitions animate from the provided values to an element's default values.
 *
 * https://svelte.dev/docs/svelte-transition#scale
 * @param {Element} node
 * @param {import('./public').ScaleParams} [params]
 * @returns {import('./public').TransitionConfig}
 */
export function scale(
	node,
	{ delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}
) {
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
			transform: ${transform} scale(${1 - sd * u});
			opacity: ${target_opacity - od * u}
		`
	};
}

/**
 * Animates the stroke of an SVG element, like a snake in a tube. `in` transitions begin with the path invisible and draw the path to the screen over time. `out` transitions start in a visible state and gradually erase the path. `draw` only works with elements that have a `getTotalLength` method, like `<path>` and `<polyline>`.
 *
 * https://svelte.dev/docs/svelte-transition#draw
 * @param {SVGElement & { getTotalLength(): number }} node
 * @param {import('./public').DrawParams} [params]
 * @returns {import('./public').TransitionConfig}
 */
export function draw(node, { delay = 0, speed, duration, easing = cubicInOut } = {}) {
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

/**
 * The `crossfade` function creates a pair of [transitions](https://svelte.dev/docs#template-syntax-element-directives-transition-fn) called `send` and `receive`. When an element is 'sent', it looks for a corresponding element being 'received', and generates a transition that transforms the element to its counterpart's position and fades it out. When an element is 'received', the reverse happens. If there is no counterpart, the `fallback` transition is used.
 *
 * https://svelte.dev/docs/svelte-transition#crossfade
 * @param {import('./public').CrossfadeParams & {
 * 	fallback?: (node: Element, params: import('./public').CrossfadeParams, intro: boolean) => import('./public').TransitionConfig;
 * }} params
 * @returns {[(node: any, params: import('./public').CrossfadeParams & { key: any; }) => () => import('./public').TransitionConfig, (node: any, params: import('./public').CrossfadeParams & { key: any; }) => () => import('./public').TransitionConfig]}
 */
export function crossfade({ fallback, ...defaults }) {
	/** @type {Map<any, Element>} */
	const to_receive = new Map();
	/** @type {Map<any, Element>} */
	const to_send = new Map();
	/**
	 * @param {Element} from_node
	 * @param {Element} node
	 * @param {import('./public').CrossfadeParams} params
	 * @returns {import('./public').TransitionConfig}
	 */
	function crossfade(from_node, node, params) {
		const {
			delay = 0,
			duration = (d) => Math.sqrt(d) * 30,
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
				transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${
				t + (1 - t) * dh
			});
			`
		};
	}

	/**
	 * @param {Map<any, Element>} items
	 * @param {Map<any, Element>} counterparts
	 * @param {boolean} intro
	 * @returns {(node: any, params: import('./public').CrossfadeParams & { key: any; }) => () => import('./public').TransitionConfig}
	 */
	function transition(items, counterparts, intro) {
		return (node, params) => {
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
	return [transition(to_send, to_receive, false), transition(to_receive, to_send, true)];
}
