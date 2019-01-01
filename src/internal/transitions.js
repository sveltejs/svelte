import { identity as linear, noop, run } from './utils.js';
import { loop } from './loop.js';
import { create_rule, delete_rule } from './style_manager.js';

let promise;

function wait() {
	if (!promise) {
		promise = Promise.resolve();
		promise.then(() => {
			promise = null;
		});
	}

	return promise;
}

let outros;

export function group_outros() {
	outros = {
		remaining: 0,
		callbacks: []
	};
}

export function wrapTransition(component, node, fn, params, intro) {
	let config = fn.call(component, node, params);
	let duration;
	let ease;
	let cssText;

	let initialised = false;

	let t = intro ? 0 : 1;
	let running = false;
	let running_program = null;
	let pending_program = null;

	function start(program) {
		node.dispatchEvent(new window.CustomEvent(`${program.b ? 'intro' : 'outro'}start`));

		program.a = t;
		program.delta = program.b - program.a;
		program.duration = duration * Math.abs(program.b - program.a);
		program.end = program.start + program.duration;

		if (config.css) {
			if (config.delay) node.style.cssText = cssText;

			program.name = create_rule(program, ease, config.css);

			node.style.animation = (node.style.animation || '')
				.split(', ')
				.filter(anim => anim && (program.delta < 0 || !/__svelte/.test(anim)))
				.concat(`${program.name} ${program.duration}ms linear 1 forwards`)
				.join(', ');
		}

		running_program = program;
		pending_program = null;
	}

	function update(now) {
		const program = running_program;
		if (!program) return;

		const p = now - program.start;
		t = program.a + program.delta * ease(p / program.duration);
		if (config.tick) config.tick(t, 1 - t);
	}

	function done() {
		const program = running_program;
		running_program = null;

		t = program.b;

		if (config.tick) config.tick(t, 1 - t);

		node.dispatchEvent(new window.CustomEvent(`${program.b ? 'intro' : 'outro'}end`));

		if (!program.b && !program.invalidated) {
			program.group.callbacks.push(() => {
				program.callback();
				if (config.css) delete_rule(node, program.name);
			});

			if (--program.group.remaining === 0) {
				program.group.callbacks.forEach(run);
			}
		} else {
			if (config.css) delete_rule(node, program.name);
		}

		running = !!pending_program;
	}

	function go(b, callback) {
		duration = config.duration || 300;
		ease = config.easing || linear;

		const program = {
			start: window.performance.now() + (config.delay || 0),
			b,
			callback: callback || noop
		};

		if (intro && !initialised) {
			if (config.css && config.delay) {
				cssText = node.style.cssText;
				node.style.cssText += config.css(0, 1);
			}

			if (config.tick) config.tick(0, 1);
			initialised = true;
		}

		if (!b) {
			program.group = outros;
			outros.remaining += 1;
		}

		if (config.delay) {
			pending_program = program;
		} else {
			start(program);
		}

		if (!running) {
			running = true;

			const { abort, promise } = loop(now => {
				if (running_program && now >= running_program.end) {
					done();
				}

				if (pending_program && now >= pending_program.start) {
					start(pending_program);
				}

				if (running) {
					update(now);
					return true;
				}
			});
		}
	}

	return {
		run(b, callback) {
			if (typeof config === 'function') {
				wait().then(() => {
					config = config();
					go(b, callback);
				});
			} else {
				go(b, callback);
			}
		},

		abort(reset) {
			if (reset && config.tick) config.tick(1, 0);

			if (running_program) {
				if (config.css) delete_rule(node, running_program.name);
				running_program = pending_program = null;
				running = false;
			}
		},

		invalidate() {
			if (running_program) {
				running_program.invalidated = true;
			}
		}
	};
}