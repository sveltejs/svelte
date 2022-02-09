import { cubicOut, cubicInOut, linear } from 'svelte/easing';
import { assign, is_function } from 'svelte/internal';

/** 
 * 
 * Easing functions specify the rate of change over time and are useful when working with Svelte's built-in transitions and animations as well as the tweened and spring utilities. `svelte/easing` contains 31 named exports, a `linear` ease and 3 variants of 10 different easing functions: `in`, `out` and `inOut`.
 * 
 * You can explore the various eases using the [ease visualiser](https://svelte.dev/examples/easing) in the [examples section](https://svelte.dev/examples).
 * 
 * 
 * | ease | in | out | inOut |
 * | --- | --- | --- | --- |
 * | **back** | `backIn` | `backOut` | `backInOut` |
 * | **bounce** | `bounceIn` | `bounceOut` | `bounceInOut` |
 * | **circ** | `circIn` | `circOut` | `circInOut` |
 * | **cubic** | `cubicIn` | `cubicOut` | `cubicInOut` |
 * | **elastic** | `elasticIn` | `elasticOut` | `elasticInOut` |
 * | **expo** | `expoIn` | `expoOut` | `expoInOut` |
 * | **quad** | `quadIn` | `quadOut` | `quadInOut` |
 * | **quart** | `quartIn` | `quartOut` | `quartInOut` |
 * | **quint** | `quintIn` | `quintOut` | `quintInOut` |
 * | **sine** | `sineIn` | `sineOut` | `sineInOut` |
 * 
 * 
 */
export type EasingFunction = (t: number) => number;

export interface TransitionConfig {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	css?: (t: number, u: number) => string;
	tick?: (t: number, u: number) => void;
}

export interface BlurParams {
	/** (`number`, default 0) — milliseconds before starting */
	delay?: number;
	/** (`number`, default 400) — milliseconds the transition lasts */
	duration?: number;
	/** (`function`, default `cubicInOut`) — an [easing function](https://svelte.dev/docs#run-time-svelte-easing) */
	easing?: EasingFunction;
	/** (`number`, default 5) - the size of the blur in pixels */
	amount?: number;
	/** (`number`, default 0) - the opacity value to animate out to and in from */
	opacity?: number;
}
/**
 * 
 * ```html
 * transition:blur={params}
 * ```
 * ```html
 * in:blur={params}
 * ```
 * ```html
 * out:blur={params}
 * ```
 * 
 * ---
 * 
 * Animates a `blur` filter alongside an element's opacity.
 * 
 * `blur` accepts the following parameters:
 * 
 * * `delay` (`number`, default 0) — milliseconds before starting
 * * `duration` (`number`, default 400) — milliseconds the transition lasts
 * * `easing` (`function`, default `cubicInOut`) — an [easing function](https://svelte.dev/docs#run-time-svelte-easing)
 * * `opacity` (`number`, default 0) - the opacity value to animate out to and in from
 * * `amount` (`number`, default 5) - the size of the blur in pixels
 * 
 * ```html
 * <script>
 * 	import { blur } from 'svelte/transition';
 * </script>
 * 
 * {#if condition}
 * 	<div transition:blur="{{amount: 10}}">
 * 		fades in and out
 * 	</div>
 * {/if}
 * ```
 * 
 * @param node 
 * @param options 
 * @returns transition config
 */
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
	/** (`number`, default 0) — milliseconds before starting */
	delay?: number;
	/** (`number`, default 400) — milliseconds the transition lasts */
	duration?: number;
	/** (`function`, default `linear`) — an [easing function](https://svelte.dev/docs#run-time-svelte-easing) */
	easing?: EasingFunction;
}

/**
 * 
 * ```html
 * transition:fade={params}
 * ```
 * ```html
 * in:fade={params}
 * ```
 * ```html
 * out:fade={params}
 * ```
 * 
 * ---
 * 
 * Animates the opacity of an element from 0 to the current opacity for `in` transitions and from the current opacity to 0 for `out` transitions.
 * 
 * `fade` accepts the following parameters:
 * 
 * * `delay` (`number`, default 0) — milliseconds before starting
 * * `duration` (`number`, default 400) — milliseconds the transition lasts
 * * `easing` (`function`, default `linear`) — an [easing function](https://svelte.dev/docs#run-time-svelte-easing)
 * 
 * You can see the `fade` transition in action in the [transition tutorial](https://svelte.dev/tutorial/transition).
 * 
 * ```html
 * <script>
 * 	import { fade } from 'svelte/transition';
 * </script>
 * 
 * {#if condition}
 * 	<div transition:fade="{{delay: 250, duration: 300}}">
 * 		fades in and out
 * 	</div>
 * {/if}
 * ```
 * @param node 
 * @param param1 
 * @returns 
 */
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
	/** (`number`, default 0) — milliseconds before starting */
	delay?: number;
	/** (`number`, default 400) — milliseconds the transition lasts */
	duration?: number;
	/** (`function`, default `cubicOut`) — an [easing function](https://svelte.dev/docs#run-time-svelte-easing) */
	easing?: EasingFunction;
	/** (`number`, default 0) - the x offset to animate out to and in from */
	x?: number;
	/** (`number`, default 0) - the y offset to animate out to and in from */
	y?: number;
	/** (`number`, default 0) - the opacity value to animate out to and in from */
	opacity?: number;
}
/**
 * 
 * ```html
 * transition:fly={params}
 * ```
 * ```html
 * in:fly={params}
 * ```
 * ```html
 * out:fly={params}
 * ```
 * 
 * ---
 * 
 * Animates the x and y positions and the opacity of an element. `in` transitions animate from an element's current (default) values to the provided values, passed as parameters. `out` transitions animate from the provided values to an element's default values.
 * 
 * `fly` accepts the following parameters:
 * 
 * * `delay` (`number`, default 0) — milliseconds before starting
 * * `duration` (`number`, default 400) — milliseconds the transition lasts
 * * `easing` (`function`, default `cubicOut`) — an [easing function](https://svelte.dev/docs#run-time-svelte-easing)
 * * `x` (`number`, default 0) - the x offset to animate out to and in from
 * * `y` (`number`, default 0) - the y offset to animate out to and in from
 * * `opacity` (`number`, default 0) - the opacity value to animate out to and in from
 * 
 * You can see the `fly` transition in action in the [transition tutorial](https://svelte.dev/tutorial/adding-parameters-to-transitions).
 * 
 * ```html
 * <script>
 * 	import { fly } from 'svelte/transition';
 * 	import { quintOut } from 'svelte/easing';
 * </script>
 * 
 * {#if condition}
 * 	<div transition:fly="{{delay: 250, duration: 300, x: 100, y: 500, opacity: 0.5, easing: quintOut}}">
 * 		flies in and out
 * 	</div>
 * {/if}
 * ```
 * 
 * @param node 
 * @param options
 * @returns transition config
 */
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
	/** (`number`, default 0) — milliseconds before starting */
	delay?: number;
	/** (`number`, default 400) — milliseconds the transition lasts */
	duration?: number;
	/** (`function`, default `cubicOut`) — an [easing function](https://svelte.dev/docs#run-time-svelte-easing) */
	easing?: EasingFunction;
}

/**
 * 
 * ```html
 * transition:slide={params}
 * ```
 * ```html
 * in:slide={params}
 * ```
 * ```html
 * out:slide={params}
 * ```
 * 
 * ---
 * 
 * Slides an element in and out.
 * 
 * `slide` accepts the following parameters:
 * 
 * * `delay` (`number`, default 0) — milliseconds before starting
 * * `duration` (`number`, default 400) — milliseconds the transition lasts
 * * `easing` (`function`, default `cubicOut`) — an [easing function](https://svelte.dev/docs#run-time-svelte-easing)
 * 
 * ```html
 * <script>
 * 	import { slide } from 'svelte/transition';
 * 	import { quintOut } from 'svelte/easing';
 * </script>
 * 
 * {#if condition}
 * 	<div transition:slide="{{delay: 250, duration: 300, easing: quintOut }}">
 * 		slides in and out
 * 	</div>
 * {/if}
 * ```
 * 
 * @param node 
 * @param options
 * @returns transition config
 */
export function slide(node: Element, {
	delay = 0,
	duration = 400,
	easing = cubicOut
}: SlideParams = {}): TransitionConfig {
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
			'overflow: hidden;' +
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

export interface ScaleParams {
	/** (`number`, default 0) — milliseconds before starting */
	delay?: number;
	/** (`number`, default 400) — milliseconds the transition lasts */
	duration?: number;
	/** (`function`, default `cubicOut`) — an [easing function](https://svelte.dev/docs#run-time-svelte-easing) */
	easing?: EasingFunction;
	/** (`number`, default 0) - the scale value to animate out to and in from */
	start?: number;
	/** (`number`, default 0) - the opacity value to animate out to and in from */
	opacity?: number;
}

/**
 * 
 * ```html
 * transition:scale={params}
 * ```
 * ```html
 * in:scale={params}
 * ```
 * ```html
 * out:scale={params}
 * ```
 * 
 * ---
 * 
 * Animates the opacity and scale of an element. `in` transitions animate from an element's current (default) values to the provided values, passed as parameters. `out` transitions animate from the provided values to an element's default values.
 * 
 * `scale` accepts the following parameters:
 * 
 * * `delay` (`number`, default 0) — milliseconds before starting
 * * `duration` (`number`, default 400) — milliseconds the transition lasts
 * * `easing` (`function`, default `cubicOut`) — an [easing function](https://svelte.dev/docs#run-time-svelte-easing)
 * * `start` (`number`, default 0) - the scale value to animate out to and in from
 * * `opacity` (`number`, default 0) - the opacity value to animate out to and in from
 * 
 * ```html
 * <script>
 * 	import { scale } from 'svelte/transition';
 * 	import { quintOut } from 'svelte/easing';
 * </script>
 * 
 * {#if condition}
 * 	<div transition:scale="{{duration: 500, delay: 500, opacity: 0.5, start: 0.5, easing: quintOut}}">
 * 		scales in and out
 * 	</div>
 * {/if}
 * ```
 * @param node 
 * @param options
 * @returns transition config
 */
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
	/** (`number`, default 0) — milliseconds before starting */
	delay?: number;
	/** (`number`, default undefined) - the speed of the animation
	 * 
	 *  The `speed` parameter is a means of setting the duration of the transition relative to the path's length. It is a modifier that is applied to the length of the path: `duration = length / speed`. A path that is 1000 pixels with a speed of 1 will have a duration of `1000ms`, setting the speed to `0.5` will double that duration and setting it to `2` will halve it 
	 */
	speed?: number;
	/** (`number` | `function`, default 800) — milliseconds the transition lasts */
	duration?: number | ((len: number) => number);
	/** (`function`, default `cubicInOut`) — an [easing function](https://svelte.dev/docs#run-time-svelte-easing) */
	easing?: EasingFunction;
}

/**
 * 
 * ```html
 * transition:draw={params}
 * ```
 * ```html
 * in:draw={params}
 * ```
 * ```html
 * out:draw={params}
 * ```
 * 
 * ---
 * 
 * Animates the stroke of an SVG element, like a snake in a tube. `in` transitions begin with the path invisible and draw the path to the screen over time. `out` transitions start in a visible state and gradually erase the path. `draw` only works with elements that have a `getTotalLength` method, like `<path>` and `<polyline>`.
 * 
 * `draw` accepts the following parameters:
 * 
 * * `delay` (`number`, default 0) — milliseconds before starting
 * * `speed` (`number`, default undefined) - the speed of the animation, see below.
 * * `duration` (`number` | `function`, default 800) — milliseconds the transition lasts
 * * `easing` (`function`, default `cubicInOut`) — an [easing function](https://svelte.dev/docs#run-time-svelte-easing)
 * 
 * The `speed` parameter is a means of setting the duration of the transition relative to the path's length. It is a modifier that is applied to the length of the path: `duration = length / speed`. A path that is 1000 pixels with a speed of 1 will have a duration of `1000ms`, setting the speed to `0.5` will double that duration and setting it to `2` will halve it.
 * 
 * ```html
 * <script>
 * 	import { draw } from 'svelte/transition';
 * 	import { quintOut } from 'svelte/easing';
 * </script>
 * 
 * <svg viewBox="0 0 5 5" xmlns="http://www.w3.org/2000/svg">
 * 	{#if condition}
 * 		<path transition:draw="{{duration: 5000, delay: 500, easing: quintOut}}"
 * 					d="M2 1 h1 v1 h1 v1 h-1 v1 h-1 v-1 h-1 v-1 h1 z"
 * 					fill="none"
 * 					stroke="cornflowerblue"
 * 					stroke-width="0.1px"
 * 					stroke-linejoin="round"
 * 		/>
 * 	{/if}
 * </svg>
 * 
 * ```
 * 
 * 
 * @param node 
 * @param options
 * @returns transition config
 */
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
		css: (t, u) => `stroke-dasharray: ${t * len} ${u * len}`
	};
}

export interface CrossfadeParams {
	/** (`number`, default 0) — milliseconds before starting */
	delay?: number;
	/** (`number` | `function`, default 800) — milliseconds the transition lasts */
	duration?: number | ((len: number) => number);
	/** (`function`, default `cubicOut`) — an [easing function](https://svelte.dev/docs#run-time-svelte-easing) */
	easing?: EasingFunction;
}

export interface CrossfadeInput extends CrossfadeParams {
	/** (`function`) — A fallback [transition](https://svelte.dev/docs#template-syntax-element-directives-transition-fn) to use for send when there is no matching element being received, and for receive when there is no element being sent.  */
	fallback?: (node: Element, params: CrossfadeParams, intro: boolean) => TransitionConfig;
}

type ClientRectMap = Map<any, { rect: ClientRect }>;

/**
 * 
 * The `crossfade` function creates a pair of [transitions](https://svelte.dev/docs#template-syntax-element-directives-transition-fn) called `send` and `receive`. When an element is 'sent', it looks for a corresponding element being 'received', and generates a transition that transforms the element to its counterpart's position and fades it out. When an element is 'received', the reverse happens. If there is no counterpart, the `fallback` transition is used.
 * 
 * ---
 * 
 * `crossfade` accepts the following parameters:
 * 
 * * `delay` (`number`, default 0) — milliseconds before starting
 * * `duration` (`number` | `function`, default 800) — milliseconds the transition lasts
 * * `easing` (`function`, default `cubicOut`) — an [easing function](https://svelte.dev/docs#run-time-svelte-easing)
 * * `fallback` (`function`) — A fallback [transition](https://svelte.dev/docs#template-syntax-element-directives-transition-fn) to use for send when there is no matching element being received, and for receive when there is no element being sent. 
 * 
 * ```html
 * <script>
 * 	import { crossfade } from 'svelte/transition';
 * 	import { quintOut } from 'svelte/easing';
 * 
 * 	const [send, receive] = crossfade({
 * 		duration:1500,
 * 		easing: quintOut
 * 	});
 * </script>
 * 
 * {#if condition}
 * 	<h1 in:send={{key}} out:receive={{key}}>BIG ELEM</h1>
 * {:else}
 * 	<small in:send={{key}} out:receive={{key}}>small elem</small>
 * {/if}
 * ```
 * 
 * 
 * @param options 
 * @returns a pair of transitions 
 */
export function crossfade({ fallback, ...defaults }: CrossfadeInput): [
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

	function crossfade(from: ClientRect, node: Element, params: CrossfadeParams): TransitionConfig {
		const {
			delay = 0,
			duration = d => Math.sqrt(d) * 30,
			easing = cubicOut
		} = assign(assign({}, defaults), params);

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
