const now = () => performance.now();

/** @param {any} timings */
function collapse_timings(timings) {
	const result = {};
	timings.forEach(
		/** @param {any} timing */ (timing) => {
			result[timing.label] = Object.assign(
				{
					total: timing.end - timing.start
				},
				timing.children && collapse_timings(timing.children)
			);
		}
	);
	return result;
}

export default class Stats {
	/**
	 * @typedef {Object} Timing
	 * @property {string} label
	 * @property {number} start
	 * @property {number} end
	 * @property {Timing[]} children
	 */

	/** @type {number} */
	start_time;

	/** @type {Timing} */
	current_timing;

	/** @type {Timing[]} */
	current_children;

	/** @type {Timing[]} */
	timings;

	/** @type {Timing[]} */
	stack;
	constructor() {
		this.start_time = now();
		this.stack = [];
		this.current_children = this.timings = [];
	}

	/** @param {any} label */
	start(label) {
		const timing = {
			label,
			start: now(),
			end: null,
			children: []
		};
		this.current_children.push(timing);
		this.stack.push(timing);
		this.current_timing = timing;
		this.current_children = timing.children;
	}

	/** @param {any} label */
	stop(label) {
		if (label !== this.current_timing.label) {
			throw new Error(
				`Mismatched timing labels (expected ${this.current_timing.label}, got ${label})`
			);
		}
		this.current_timing.end = now();
		this.stack.pop();
		this.current_timing = this.stack[this.stack.length - 1];
		this.current_children = this.current_timing ? this.current_timing.children : this.timings;
	}
	render() {
		const timings = Object.assign(
			{
				total: now() - this.start_time
			},
			collapse_timings(this.timings)
		);
		return {
			timings
		};
	}
}
