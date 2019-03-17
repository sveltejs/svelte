import { identity as linear, noop, run_all } from './utils.js';
import { loop } from './loop.js';
import { create_rule, delete_rule } from './style_manager.js';
import { custom_event } from './dom.js';
import { add_render_callback } from './scheduler.js';

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

function dispatch(node, direction, kind) {
	node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
}

let outros;

export function group_outros() {
	outros = {
		remaining: 0,
		callbacks: []
	};
}

export function check_outros() {
	if (!outros.remaining) {
		run_all(outros.callbacks);
	}
}

export function on_outro(callback) {
	outros.callbacks.push(callback);
}

const null_transition = { duration: 0 };

export function create_in_transition(node, fn, params) {
	let config = fn(node, params);
	let running = false;
	let animation_name;
	let task;
	let uid = 0;

	function cleanup() {
		if (animation_name) delete_rule(node, animation_name);
	}

	function go() {
		const {
			delay = 0,
			duration = 300,
			easing = linear,
			tick = noop,
			css
		} = config || null_transition;

		if (css) animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
		tick(0, 1);

		const start_time = window.performance.now() + delay;
		const end_time = start_time + duration;

		if (task) task.abort();
		running = true;

		task = loop(now => {
			if (running) {
				if (now >= end_time) {
					tick(1, 0);
					cleanup();
					return running = false;
				}

				if (now >= start_time) {
					const t = easing((now - start_time) / duration);
					tick(t, 1 - t);
				}
			}

			return running;
		});
	}

	let started = false;

	return {
		start() {
			if (started) return;

			delete_rule(node);

			if (typeof config === 'function') {
				config = config();
				wait().then(go);
			} else {
				go();
			}
		},

		invalidate() {
			started = false;
		},

		end() {
			if (running) {
				cleanup();
				running = false;
			}
		}
	};
}

export function create_out_transition(node, fn, params) {
	let config = fn(node, params);
	let running = true;
	let animation_name;

	const group = outros;

	group.remaining += 1;

	function go() {
		const {
			delay = 0,
			duration = 300,
			easing = linear,
			tick = noop,
			css
		} = config || null_transition;

		if (css) animation_name = create_rule(node, 1, 0, duration, delay, easing, css);

		const start_time = window.performance.now() + delay;
		const end_time = start_time + duration;

		loop(now => {
			if (running) {
				if (now >= end_time) {
					tick(0, 1);

					if (!--group.remaining) {
						// this will result in `end()` being called,
						// so we don't need to clean up here
						run_all(group.callbacks);
					}

					return false;
				}

				if (now >= start_time) {
					const t = easing((now - start_time) / duration);
					tick(1 - t, t);
				}
			}

			return running;
		});
	}

	if (typeof config === 'function') {
		wait().then(() => {
			config = config();
			go();
		});
	} else {
		go();
	}

	return {
		end(reset) {
			if (reset && config.tick) {
				config.tick(1, 0);
			}

			if (running) {
				if (animation_name) delete_rule(node, animation_name);
				running = false;
			}
		}
	};
}

export function create_bidirectional_transition(node, fn, params, intro) {
	let config = fn(node, params);

	let t = intro ? 0 : 1;

	let running_program = null;
	let pending_program = null;
	let animation_name = null;

	function clear_animation() {
		if (animation_name) delete_rule(node, animation_name);
	}

	function init(program, duration) {
		const d = program.b - t;
		duration *= Math.abs(d);

		return {
			a: t,
			b: program.b,
			d,
			duration,
			start: program.start,
			end: program.start + duration,
			group: program.group
		};
	}

	function go(b) {
		const {
			delay = 0,
			duration = 300,
			easing = linear,
			tick = noop,
			css
		} = config || null_transition;

		const program = {
			start: window.performance.now() + delay,
			b
		};

		if (!b) {
			program.group = outros;
			outros.remaining += 1;
		}

		if (running_program) {
			pending_program = program;
		} else {
			// if this is an intro, and there's a delay, we need to do
			// an initial tick and/or apply CSS animation immediately
			if (css) {
				clear_animation();
				animation_name = create_rule(node, t, b, duration, delay, easing, css);
			}

			if (b) tick(0, 1);

			running_program = init(program, duration);
			add_render_callback(() => dispatch(node, b, 'start'))

			loop(now => {
				if (pending_program && now > pending_program.start) {
					running_program = init(pending_program, duration);
					pending_program = null;

					dispatch(node, running_program.b, 'start');

					if (css) {
						clear_animation();
						animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
					}
				}

				if (running_program) {
					if (now >= running_program.end) {
						tick(t = running_program.b, 1 - t);
						dispatch(node, running_program.b, 'end');

						if (!pending_program) {
							// we're done
							if (running_program.b) {
								// intro — we can tidy up immediately
								clear_animation();
							} else {
								// outro — needs to be coordinated
								if (!--running_program.group.remaining) run_all(running_program.group.callbacks);
							}
						}

						running_program = null;
					}

					else if (now >= running_program.start) {
						const p = now - running_program.start;
						t = running_program.a + running_program.d * easing(p / running_program.duration);
						tick(t, 1 - t);
					}
				}

				return !!(running_program || pending_program);
			});
		}
	}

	return {
		run(b) {
			if (typeof config === 'function') {
				wait().then(() => {
					config = config();
					go(b);
				});
			} else {
				go(b);
			}
		},

		end() {
			clear_animation();
			running_program = pending_program = null;
		}
	};
}