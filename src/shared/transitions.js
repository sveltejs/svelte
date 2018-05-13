import { createElement } from './dom.js';
import { noop, run } from './utils.js';

export function linear(t) {
	return t;
}

export function generateRule({ a, b, delta, duration }, ease, fn) {
	const step = 16.666 / duration;
	let keyframes = '{\n';

	for (let p = 0; p <= 1; p += step) {
		const t = a + delta * ease(p);
		keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
	}

	return keyframes + `100% {${fn(b, 1 - b)}}\n}`;
}

// https://github.com/darkskyapp/string-hash/blob/master/index.js
export function hash(str) {
	let hash = 5381;
	let i = str.length;

	while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
	return hash >>> 0;
}

export class Transition {
	constructor(component, node, fn) {
		this.component = component;
		this.node = node;
		this.fn = fn;

		this.cssText = node.style.cssText;

		this.a = 0;
		this.t = 0;
		this.b = 1;
		this.delta = 1;

		this.duration = 300;
		this.delay = 0;
		this.ease = linear;

		this.rule = '';
		this.name = '';

		this.running = true;
		this.started = false;
	}

	play(params) {
		const info = this.fn(this.node, params);

		if (typeof info === 'function') {
			transitionManager.wait().then(() => {
				this.schedule(info());
			});
		} else {
			this.schedule(info);
		}
	}

	schedule(info) {
		if ('duration' in info) this.duration = info.duration;
		if ('delay' in info) this.delay = info.delay;
		if ('easing' in info) this.ease = info.easing;

		this.tick = info.tick;
		this.css = info.css;

		this.start = window.performance.now() + this.delay;
		this.end = this.start + this.duration;

		if (info.css) {
			if (this.type === 'intro' && this.delay) node.style.cssText += info.css(this.a, 1 - this.a);
			this.rule = generateRule(this, this.ease, info.css);
			this.name = `__svelte_${hash(this.rule)}`;
		}

		if (this.type === 'intro' && info.tick) {
			info.tick(this.a, 1 - this.a);
		}

		transitionManager.add(this);
	}

	update(now) {
		if (now < this.start) return;

		if (!this.started) {
			this.component.fire(`${this.type}.start`, { node: this.node });

			if (this.rule) {
				transitionManager.addRule(this.rule, this.name);

				this.node.style.animation = (this.node.style.animation || '')
					.split(', ')
					.filter(anim => anim && (this.delta < 0 || !/__svelte/.test(anim)))
					.concat(`${this.name} ${this.duration}ms linear 1 forwards`)
					.join(', ');
			}

			this.started = true;
		}

		if (now >= this.end) return this.done();

		const p = now - this.start;
		this.t = this.a + this.delta * this.ease(p / this.duration);
		if (this.tick) this.tick(this.t, 1 - this.t);
	}

	abort() {
		if (this.tick) this.tick(this.a, 1 - this.a);
		if (this.rule) transitionManager.deleteRule(this.node, this.name);
		this.running = false;
	}

	done() {
		if (this.tick) this.tick(this.b, 1 - this.b);
		this.running = false;

		this.component.fire(`${this.type}.end`, { node: this.node });
	}

	tick() {}
}

export class Intro extends Transition {
	constructor(component, node, fn) {
		super(component, node, fn);

		this.type = 'intro';

		this.cssText = node.style.cssText;

		this.a = 0;
		this.t = 0;
		this.b = 1;
		this.delta = 1;
	}

	done() {
		if (this.css) transitionManager.deleteRule(this.node, this.name);
		super.done();
	}
}

export class Outro extends Transition{
	constructor(component, node, fn) {
		super(component, node, fn);

		this.type = 'outro';

		this.a = 1;
		this.t = 1;
		this.b = 0;
		this.delta = -1;

		this.invalidated = false;
		this.group = null;
		this.callback = null;
	}

	play(params, callback) {
		this.callback = callback;
		this.group = transitionManager.outros;
		transitionManager.outros.remaining += 1;

		super.play(params);
	}

	done() {
		if (!this.invalidated) {
			this.group.callbacks.push(() => {
				this.callback();
				if (this.rule) transitionManager.deleteRule(node, this.name);
			});

			if (--this.group.remaining === 0) {
				this.group.callbacks.forEach(run);
			}
		}

		super.done();
	}

	invalidate() {
		this.invalidated = true;
	}
}

export function wrapTransition(component, node, fn, params, intro) {
	let obj = fn(node, params);
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
				program.group = transitionManager.outros;
				transitionManager.outros.remaining += 1;
			}

			if (obj.delay) {
				this.pending = program;
			} else {
				this.start(program);
			}

			if (!this.running) {
				this.running = true;
				transitionManager.add(this);
			}
		},

		start(program) {
			component.fire(`${program.b ? 'intro' : 'outro'}.start`, { node });

			program.a = this.t;
			program.delta = program.b - program.a;
			program.duration = duration * Math.abs(program.b - program.a);
			program.end = program.start + program.duration;

			if (obj.css) {
				if (obj.delay) node.style.cssText = cssText;

				const rule = generateRule(program, ease, obj.css);
				transitionManager.addRule(rule, program.name = '__svelte_' + hash(rule));

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
			this.t = program.b;

			if (obj.tick) obj.tick(this.t, 1 - this.t);

			component.fire(`${program.b ? 'intro' : 'outro'}.end`, { node });

			if (!program.b && !program.invalidated) {
				program.group.callbacks.push(() => {
					program.callback();
					if (obj.css) transitionManager.deleteRule(node, program.name);
				});

				if (--program.group.remaining === 0) {
					program.group.callbacks.forEach(fn => {
						fn();
					});
				}
			} else {
				if (obj.css) transitionManager.deleteRule(node, program.name);
			}

			this.running = !!this.pending;
		},

		abort() {
			if (this.program) {
				if (obj.tick) obj.tick(1, 0);
				if (obj.css) transitionManager.deleteRule(node, this.program.name);
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

export var transitionManager = {
	running: false,
	transitions: [],
	bound: null,
	stylesheet: null,
	activeRules: {},
	promise: null,

	add(transition) {
		this.transitions.push(transition);

		if (!this.running) {
			this.running = true;
			requestAnimationFrame(this.bound || (this.bound = this.next.bind(this)));
		}
	},

	addRule(rule, name) {
		if (!this.stylesheet) {
			const style = createElement('style');
			document.head.appendChild(style);
			transitionManager.stylesheet = style.sheet;
		}

		if (!this.activeRules[name]) {
			this.activeRules[name] = true;
			this.stylesheet.insertRule(`@keyframes ${name} ${rule}`, this.stylesheet.cssRules.length);
		}
	},

	next() {
		this.running = false;

		const now = window.performance.now();
		let i = this.transitions.length;

		while (i--) {
			const transition = this.transitions[i];

			if (transition.program && now >= transition.program.end) {
				transition.done();
			}

			if (transition.pending && now >= transition.pending.start) {
				transition.start(transition.pending);
			}

			if (transition.running) {
				transition.update(now);
				this.running = true;
			} else if (!transition.pending) {
				this.transitions.splice(i, 1);
			}
		}

		if (this.running) {
			requestAnimationFrame(this.bound);
		} else if (this.stylesheet) {
			let i = this.stylesheet.cssRules.length;
			while (i--) this.stylesheet.deleteRule(i);
			this.activeRules = {};
		}
	},

	deleteRule(node, name) {
		node.style.animation = node.style.animation
			.split(', ')
			.filter(anim => anim && anim.indexOf(name) === -1)
			.join(', ');
	},

	groupOutros() {
		this.outros = {
			remaining: 0,
			callbacks: []
		};
	},

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
