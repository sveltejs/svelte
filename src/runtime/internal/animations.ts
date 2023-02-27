import { identity as linear, noop } from './utils';
import { now } from './environment';
import { loop } from './loop';
import { create_rule, delete_rule } from './style_manager';
import { AnimationConfig } from '../animate';


//todo: documentation says it is DOMRect, but in IE it would be ClientRect
type PositionRect = DOMRect | ClientRect;

type AnimationFn = (node: Element, { from, to }: { from: PositionRect; to: PositionRect }, params: any) => AnimationConfig;

export function create_animation(node: Element & ElementCSSInlineStyle, from: PositionRect, fn: AnimationFn, params) {
	if (!from) return noop;

	const to = node.getBoundingClientRect();
	if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom) return noop;


	const {
		delay = 0,
		duration = 300,
		easing = linear,
		// @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
		start: start_time = now() + delay,
		// @ts-ignore todo:
		end = start_time + duration,
		tick = noop,
		css
	} = fn(node, { from, to }, params);

	let running = true;
	let started = false;
	let name;

	function start() {
		if (css) {
			name = create_rule(node, 0, 1, duration, delay, easing, css);
		}

		if (!delay) {
			started = true;
		}
	}

	function stop() {
		if (css) delete_rule(node, name);
		running = false;
	}

	loop(now => {
		if (!started && now >= start_time) {
			started = true;
		}

		if (started && now >= end) {
			tick(1, 0);
			stop();
		}

		if (!running) {
			return false;
		}

		if (started) {
			const p = now - start_time;
			const t = 0 + 1 * easing(p / duration);
			tick(t, 1 - t);
		}

		return true;
	});

	start();

	tick(0, 1);

	return stop;
}

export function fix_position(node: Element & ElementCSSInlineStyle) {
	const style = getComputedStyle(node);

	if (style.position !== 'absolute' && style.position !== 'fixed') {
		const { width, height } = style;
		const a = node.getBoundingClientRect();
		node.style.position = 'absolute';
		node.style.width = width;
		node.style.height = height;
		add_transform(node, a);
	}
}

export function add_transform(node: Element & ElementCSSInlineStyle, a: PositionRect) {
	const b = node.getBoundingClientRect();

	if (a.left !== b.left || a.top !== b.top) {
		const style = getComputedStyle(node);
		const transform = style.transform === 'none' ? '' : style.transform;

		node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
	}
}
