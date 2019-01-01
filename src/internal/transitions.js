import { identity as linear, noop, run } from './utils.js';
import { loop } from './loop.js';
import { add_rule, delete_rule, generate_rule } from './style_manager.js';

// https://github.com/darkskyapp/string-hash/blob/master/index.js
export function hash(str) {
	let hash = 5381;
	let i = str.length;

	while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
	return hash >>> 0;
}

export function wrapTransition(component, node, fn, params, intro) {
	let obj = fn.call(component, node, params);
	let duration;
	let ease;
	let cssText;

	let initialised = false;

	return {
		t: intro ? 0 : 1,
		running: false,
		program: null,
		pending: null,

		run(b, callback) {
			if (typeof obj === 'function') {
				transitionManager.wait().then(() => {
					obj = obj();
					this._run(b, callback);
				});
			} else {
				this._run(b, callback);
			}
		},

		_run(b, callback) {
			duration = obj.duration || 300;
			ease = obj.easing || linear;

			const program = {
				start: window.performance.now() + (obj.delay || 0),
				b,
				callback: callback || noop
			};

			if (intro && !initialised) {
				if (obj.css && obj.delay) {
					cssText = node.style.cssText;
					node.style.cssText += obj.css(0, 1);
				}

				if (obj.tick) obj.tick(0, 1);
				initialised = true;
			}

			if (!b) {
				program.group = outros.current;
				outros.current.remaining += 1;
			}

			if (obj.delay) {
				this.pending = program;
			} else {
				this.start(program);
			}

			if (!this.running) {
				this.running = true;

				const { abort, promise } = loop(() => {
					const now = window.performance.now();

					if (this.program && now >= this.program.end) {
						this.done();
					}

					if (this.pending && now >= this.pending.start) {
						this.start(this.pending);
					}

					if (this.running) {
						this.update(now);
						return true;
					}
				});
			}
		},

		start(program) {
			node.dispatchEvent(new window.CustomEvent(`${program.b ? 'intro' : 'outro'}start`));

			program.a = this.t;
			program.delta = program.b - program.a;
			program.duration = duration * Math.abs(program.b - program.a);
			program.end = program.start + program.duration;

			if (obj.css) {
				if (obj.delay) node.style.cssText = cssText;

				const rule = generate_rule(program, ease, obj.css);
				add_rule(rule, program.name = '__svelte_' + hash(rule));

				node.style.animation = (node.style.animation || '')
					.split(', ')
					.filter(anim => anim && (program.delta < 0 || !/__svelte/.test(anim)))
					.concat(`${program.name} ${program.duration}ms linear 1 forwards`)
					.join(', ');
			}

			this.program = program;
			this.pending = null;
		},

		update(now) {
			const program = this.program;
			if (!program) return;

			const p = now - program.start;
			this.t = program.a + program.delta * ease(p / program.duration);
			if (obj.tick) obj.tick(this.t, 1 - this.t);
		},

		done() {
			const program = this.program;
			this.program = null;

			this.t = program.b;

			if (obj.tick) obj.tick(this.t, 1 - this.t);

			node.dispatchEvent(new window.CustomEvent(`${program.b ? 'intro' : 'outro'}end`));

			if (!program.b && !program.invalidated) {
				program.group.callbacks.push(() => {
					program.callback();
					if (obj.css) delete_rule(node, program.name);
				});

				if (--program.group.remaining === 0) {
					program.group.callbacks.forEach(run);
				}
			} else {
				if (obj.css) delete_rule(node, program.name);
			}

			this.running = !!this.pending;
		},

		abort(reset) {
			if (reset && obj.tick) obj.tick(1, 0);

			if (this.program) {
				if (obj.css) delete_rule(node, this.program.name);
				this.program = this.pending = null;
				this.running = false;
			}
		},

		invalidate() {
			if (this.program) {
				this.program.invalidated = true;
			}
		}
	};
}

export let outros = {};

export function groupOutros() {
	outros.current = {
		remaining: 0,
		callbacks: []
	};
}

export var transitionManager = {
	promise: null,

	wait() {
		if (!transitionManager.promise) {
			transitionManager.promise = Promise.resolve();
			transitionManager.promise.then(() => {
				transitionManager.promise = null;
			});
		}

		return transitionManager.promise;
	}
};
