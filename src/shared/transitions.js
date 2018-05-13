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
	constructor(component, node, fn, counterpart) {
		this.component = component;
		this.node = node;
		this.fn = fn;

		this.cssText = node.style.cssText;

		this.duration = 300;
		this.delay = 0;
		this.ease = linear;

		this.rule = '';
		this.name = '';

		this.counterpart = counterpart;
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
			if (this.type === 'intro' && this.delay) this.node.style.cssText += info.css(this.a, 1 - this.a);
		}

		if (this.type === 'intro' && info.tick) {
			info.tick(this.a, 1 - this.a);
		}

		if (!this.delay) this.begin();

		transitionManager.add(this);
	}

	begin() {
		if (this.counterpart) {
			this.a = this.counterpart.t;
			this.delta = this.b - this.a;
			this.duration *= Math.abs(this.delta);
		}

		if (this.css) {
			this.rule = generateRule(this, this.ease, this.css);
			this.name = `__svelte_${hash(this.rule)}`;
		}

		this.component.fire(`${this.type}.start`, { node: this.node });

		if (this.rule) {
			if (this.type === 'intro' && this.delay) this.node.style.cssText = this.cssText;

			transitionManager.addRule(this.rule, this.name);

			this.node.style.animation = (this.node.style.animation || '')
				.split(', ')
				.filter(anim => anim && (this.delta < 0 || !/__svelte/.test(anim)))
				.concat(`${this.name} ${this.duration}ms linear 1 forwards`)
				.join(', ');
		}

		this.started = true;
	}

	update(now) {
		if (now < this.start) return;
		if (!this.started) this.begin();

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
	constructor(component, node, fn, counterpart) {
		super(component, node, fn, counterpart);

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
	constructor(component, node, fn, counterpart) {
		super(component, node, fn, counterpart);

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

export class BidirectionalTransition {
	constructor(component, node, fn) {
		this.component = component;
		this.node = node;
		this.fn = fn;

		this.in = null;
		this.out = null;
	}

	intro(params) {
		if (this.out) this.out.invalidate();
		this.in = new Intro(this.component, this.node, this.fn, this.out);

		this.in.play(params);
	}

	outro(params, callback) {
		this.out = new Outro(this.component, this.node, this.fn, this.in);

		this.out.play(params, callback);
	}
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
