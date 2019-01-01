import { identity as linear } from './utils.js';
import { loop } from './loop.js';
import { create_rule, delete_rule } from './style_manager.js';

export function wrapAnimation(node, from, fn, params) {
	if (!from) return;

	const to = node.getBoundingClientRect();
	if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom) return;

	const info = fn(node, { from, to }, params);

	const duration = 'duration' in info ? info.duration : 300;
	const delay = 'delay' in info ? info.delay : 0;
	const ease = info.easing || linear;
	const start_time = window.performance.now() + delay;
	const end = start_time + duration;

	const program = {
		a: 0,
		t: 0,
		b: 1,
		delta: 1,
		duration,
		start: start_time,
		end
	};

	const cssText = node.style.cssText;

	function start() {
		if (info.css) {
			if (delay) node.style.cssText = cssText;

			program.name = create_rule(program, ease, info.css);

			node.style.animation = (node.style.animation || '')
				.split(', ')
				.filter(anim => anim && (program.delta < 0 || !/__svelte/.test(anim)))
				.concat(`${program.name} ${program.duration}ms linear 1 forwards`)
				.join(', ');
		}

		running_program = program;
		pending_program = null;
	}

	let running = true;
	let pending_program = delay ? program : null;
	let running_program = delay ? null : program;

	function stop() {
		if (info.css) delete_rule(node, program.name);
		running = false;
	}

	const { abort, promise } = loop(now => {
		if (pending_program && now >= pending_program.start) {
			start();
		}

		if (running_program && now >= running_program.end) {
			if (info.tick) info.tick(1, 0);
			stop();
		}

		if (!running) {
			return false;
		}

		if (running_program) {
			const p = now - program.start;
			const t = program.a + program.delta * ease(p / program.duration);
			if (info.tick) info.tick(t, 1 - t);
		}

		return true;
	});

	if (info.tick) info.tick(0, 1);

	if (delay) {
		if (info.css) node.style.cssText += info.css(0, 1);
	} else {
		start();
	}

	// TODO just return the function
	return { stop };
}

export function fixPosition(node) {
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