import { identity as linear, noop, now } from './utils';
import { loop } from './loop';
import { create_rule, delete_rule } from './style_manager';

export function create_animation(node, from, fn, params) {
	if (!from) return noop;

	const to = node.getBoundingClientRect();
	if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom) return noop;

	const {
		delay = 0,
		duration = 300,
		easing = linear,
		start: start_time = now() + delay,
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

export function fix_position(node) {
	const style = getComputedStyle(node);

	if (style.position !== 'absolute' && style.position !== 'fixed') {
		const { width, height } = style;
		const a = node.getBoundingClientRect();
		node.style.position = 'absolute';
		node.style.width = width;
		node.style.height = height;
		const b = node.getBoundingClientRect();

		if (a.left !== b.left || a.top !== b.top) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
		}
	}
}
