import { transitionManager, linear, generateRule, hash } from './transitions.js';
import { loop } from './loop.js';

export function wrapAnimation(node, from, fn, params) {
	if (!from) return;

	const to = node.getBoundingClientRect();
	if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom) return;

	const info = fn(node, { from, to }, params);

	const duration = 'duration' in info ? info.duration : 300;
	const delay = 'delay' in info ? info.delay : 0;
	const ease = info.easing || linear;
	const start = window.performance.now() + delay;
	const end = start + duration;

	const program = {
		a: 0,
		t: 0,
		b: 1,
		delta: 1,
		duration,
		start,
		end
	};

	const cssText = node.style.cssText;

	const animation = {
		pending: delay ? program : null,
		program: delay ? null : program,
		running: true,

		start() {
			if (info.css) {
				if (delay) node.style.cssText = cssText;

				const rule = generateRule(program, ease, info.css);
				program.name = `__svelte_${hash(rule)}`;

				transitionManager.addRule(rule, program.name);

				node.style.animation = (node.style.animation || '')
					.split(', ')
					.filter(anim => anim && (program.delta < 0 || !/__svelte/.test(anim)))
					.concat(`${program.name} ${program.duration}ms linear 1 forwards`)
					.join(', ');
			}

			animation.program = program;
			animation.pending = null;
		},

		update: now => {
			const p = now - program.start;
			const t = program.a + program.delta * ease(p / program.duration);
			if (info.tick) info.tick(t, 1 - t);
		},

		done() {
			if (info.tick) info.tick(1, 0);
			animation.stop();
		},

		stop() {
			if (info.css) transitionManager.deleteRule(node, program.name);
			animation.running = false;
		}
	};

	// transitionManager.add(animation);

	transitionManager.active += 1;

	const { abort, promise } = loop(() => {
		const now = window.performance.now();

		if (animation.program && now >= animation.program.end) {
			animation.done();
		}

		if (animation.pending && now >= animation.pending.start) {
			animation.start(animation.pending);
		}

		if (animation.running) {
			animation.update(now);
			return true;
		}
	});

	promise.then(() => {
		transitionManager.active -= 1;
		if (!transitionManager.active) {
			let i = transitionManager.stylesheet.cssRules.length;
			while (i--) transitionManager.stylesheet.deleteRule(i);
			transitionManager.activeRules = {};
		}
	});

	if (info.tick) info.tick(0, 1);

	if (delay) {
		if (info.css) node.style.cssText += info.css(0, 1);
	} else {
		animation.start();
	}

	return animation;
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