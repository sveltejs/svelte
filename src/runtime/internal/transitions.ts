import { identity as linear, is_function, noop, run_all } from './utils';
import { now } from './environment';
import { loop } from './loop';
import { create_rule, delete_rule } from './style_manager';
import { custom_event } from './dom';
import { add_render_callback } from './scheduler';
import { TransitionConfig } from '../transition';

let promise: Promise<void>|null;

function wait() {
	if (!promise) {
		promise = Promise.resolve();
		promise.then(() => {
			promise = null;
		});
	}

	return promise;
}

function dispatch(node: Element, direction: boolean, kind: 'start' | 'end') {
	node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
}

const outroing = new Set();
let outros;

export function group_outros() {
	outros = {
		r: 0,     // remaining outros
		c: [],    // callbacks
		p: outros // parent group
	};
}

export function check_outros() {
	if (!outros.r) {
		run_all(outros.c);
	}
	outros = outros.p;
}

export function transition_in(block, local?: 0 | 1) {
	if (block && block.i) {
		outroing.delete(block);
		block.i(local);
	}
}

export function transition_out(block, local: 0 | 1, detach?: 0 | 1, callback?) {
	if (block && block.o) {
		if (outroing.has(block)) return;
		outroing.add(block);

		outros.c.push(() => {
			outroing.delete(block);
			if (callback) {
				if (detach) block.d(1);
				callback();
			}
		});

		block.o(local);
	}
}

const null_transition: TransitionConfig = { duration: 0 };

type TransitionFn = (node: Element, params: any) => TransitionConfig;

export function create_in_transition(node: Element & ElementCSSInlineStyle, fn: TransitionFn, params: any) {
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

		const start_time = now() + delay;
		const end_time = start_time + duration;

		if (task) task.abort();
		running = true;

		add_render_callback(() => dispatch(node, true, 'start'));

		task = loop(now => {
			if (running) {
				if (now >= end_time) {
					tick(1, 0);

					dispatch(node, true, 'end');

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

			if (is_function(config)) {
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

export function create_out_transition(node: Element & ElementCSSInlineStyle, fn: TransitionFn, params: any) {
	let config = fn(node, params);
	let running = true;
	let animation_name;

	const group = outros;

	group.r += 1;

	function go() {
		const {
			delay = 0,
			duration = 300,
			easing = linear,
			tick = noop,
			css
		} = config || null_transition;

		if (css) animation_name = create_rule(node, 1, 0, duration, delay, easing, css);

		const start_time = now() + delay;
		const end_time = start_time + duration;

		add_render_callback(() => dispatch(node, false, 'start'));

		loop(now => {
			if (running) {
				if (now >= end_time) {
					tick(0, 1);

					dispatch(node, false, 'end');

					if (!--group.r) {
						// this will result in `end()` being called,
						// so we don't need to clean up here
						run_all(group.c);
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

	if (is_function(config)) {
		wait().then(() => {
			// @ts-ignore
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

export function create_bidirectional_transition(node: Element & ElementCSSInlineStyle, fn: TransitionFn, params: any, intro: boolean) {
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
			start: now() + delay,
			b
		};

		if (!b) {
			// @ts-ignore todo: improve typings
			program.group = outros;
			outros.r += 1;
		}

		if (running_program || pending_program) {
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
			add_render_callback(() => dispatch(node, b, 'start'));

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
								if (!--running_program.group.r) run_all(running_program.group.c);
							}
						}

						running_program = null;
					} else if (now >= running_program.start) {
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
			if (is_function(config)) {
				wait().then(() => {
					// @ts-ignore
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
