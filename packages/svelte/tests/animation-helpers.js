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

// TODO tidy this up
class Animation {
	#keyframes;
	#duration;
	#timeline_offset;
	#reversed;
	#target;
	#paused;

	#offset = 0;
	#finished = () => {};
	#cancelled = () => {};

	currentTime = 0;

	/**
	 * @param {HTMLElement} target
	 * @param {Keyframe[]} keyframes
	 * @param {{duration?: number}} options
	 */
	constructor(target, keyframes, options = {}) {
		this.#target = target;
		this.#keyframes = keyframes;
		this.#duration = options.duration || 0;

		this.#timeline_offset = 0;
		this.#reversed = false;
		this.#paused = false;
		this.onfinish = () => {};
		this.pending = true;
		this.currentTime = 0;
		this.playState = 'running';
		this.effect = {
			setKeyframes: (/** @type {Keyframe[]} */ keyframes) => {
				this.#keyframes = keyframes;
			}
		};

		this.#offset = raf.time;

		// Promise-like semantics, but call callbacks immediately on raf.tick
		this.finished = {
			/** @param {() => void} callback */
			then: (callback) => {
				this.#finished = callback;

				return {
					/** @param {() => void} callback */
					catch: (callback) => {
						this.#cancelled = callback;
					}
				};
			}
		};
	}

	play() {
		this.#paused = false;
		raf.animations.add(this);
		this.playState = 'running';
		this._update();
	}

	_update() {
		if (this.#reversed) {
			if (this.#timeline_offset === 0) {
				this.currentTime = this.#duration - raf.time;
			} else {
				this.currentTime = this.#timeline_offset + (this.#timeline_offset - raf.time);
			}
		} else {
			this.currentTime = raf.time - this.#timeline_offset;
		}
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
		if (this.#reversed) {
			if (this.currentTime <= 0) {
				this.finish();
				for (let prop in frame) {
					// @ts-ignore
					this.#target.style[prop] = null;
				}
			}
		} else {
			if (this.currentTime >= this.#duration) {
				this.finish();
				for (let prop in frame) {
					// @ts-ignore
					this.#target.style[prop] = null;
				}
			}
		}
	}

	finish() {
		this.onfinish();
		this.currentTime = this.#reversed ? 0 : this.#duration;
		if (this.#reversed) {
			raf.animations.delete(this);
		}
		this.playState = 'idle';
	}

	cancel() {
		this.#paused = true;
		if (this.currentTime > 0 && this.currentTime < this.#duration) {
			this._applyKeyFrame(this.#reversed ? this.#keyframes.length - 1 : 0);
		}

		this.#cancelled();
		raf.animations.delete(this);
	}

	pause() {
		this.#paused = true;
		this.playState = 'paused';
	}

	reverse() {
		if (this.#paused && !raf.animations.has(this)) {
			raf.animations.add(this);
		}
		this.#timeline_offset = this.currentTime;
		this.#reversed = !this.#reversed;
		this.playState = 'running';
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
