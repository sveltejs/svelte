import { raf as svelte_raf } from 'svelte/internal';

export const raf = {
	animations: new Set(),
	ticks: new Set(),
	tick,
	time: 0,
	reset() {
		this.time = 0;
		this.animations.clear();
		this.ticks.clear();

		svelte_raf.tick = (f) => {
			raf.ticks.add(f);
		};
		svelte_raf.now = () => raf.time;
	}
};

/**
 * @param {number} time
 */
function tick(time) {
	raf.time = time;
	for (const animation of raf.animations) {
		animation._update();
	}
	for (const tick of raf.ticks) {
		tick(raf.time);
	}
}

class Animation {
	#keyframes;
	#duration;
	#target;
	#finished;
	#cancelled;

	/**
	 * @param {HTMLElement} target
	 * @param {Keyframe[]} keyframes
	 * @param {{duration?: number}} options
	 */
	constructor(target, keyframes, options = {}) {
		this.#target = target;
		this.#keyframes = keyframes;
		this.#duration = options.duration || 0;
		this.currentTime = 0;

		// Promise-like semantics, but call callbacks immediately on raf.tick
		this.finished = {
			then: (callback) => {
				this.#finished = callback;

				return {
					catch: (callback) => {
						this.#cancelled = callback;
					}
				};
			}
		};
	}

	cancel() {
		if (this.currentTime > 0 && this.currentTime < this.#duration) {
			this._applyKeyFrame(0);
		}

		this.#cancelled();
	}

	_update() {
		this.currentTime = raf.time;

		const target_frame = this.currentTime / this.#duration;
		this._applyKeyFrame(target_frame);

		if (this.currentTime >= this.#duration) {
			this.#finished();
			raf.animations.delete(this);
		}
	}

	/**
	 * @param {number} target_frame
	 */
	_applyKeyFrame(target_frame) {
		const keyframes = this.#keyframes;
		const keyframes_size = keyframes.length - 1;
		const frame = keyframes[Math.min(keyframes_size, Math.floor(keyframes.length * target_frame))];
		for (let prop in frame) {
			// @ts-ignore
			this.#target.style[prop] = frame[prop];
		}

		if (this.currentTime >= this.#duration) {
			for (let prop in frame) {
				// @ts-ignore
				this.#target.style[prop] = null;
			}
		}
	}
}

/**
 * @param {Keyframe[]} keyframes
 * @param {{duration?: number}} options
 * @returns {globalThis.Animation}
 */
HTMLElement.prototype.animate = function (keyframes, options) {
	const animation = new Animation(this, keyframes, options);
	raf.animations.add(animation);
	// @ts-ignore
	return animation;
};
