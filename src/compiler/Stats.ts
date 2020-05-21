const now = (typeof process !== 'undefined' && process.hrtime)
	? () => {
		const t = process.hrtime();
		return t[0] * 1e3 + t[1] / 1e6;
	}
	: () => self.performance.now();

interface Timing {
	label: string;
	start: number;
	end: number;
	children: Timing[];
}

function collapse_timings(timings) {
	const result = {};
	timings.forEach(timing => {
		result[timing.label] = Object.assign({
			total: timing.end - timing.start
		}, timing.children && collapse_timings(timing.children));
	});
	return result;
}

export default class Stats {
	start_time: number;
	current_timing: Timing;
	current_children: Timing[];
	timings: Timing[];
	stack: Timing[];

	constructor() {
		this.start_time = now();
		this.stack = [];
		this.current_children = this.timings = [];
	}

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

	stop(label) {
		if (label !== this.current_timing.label) {
			throw new Error(`Mismatched timing labels (expected ${this.current_timing.label}, got ${label})`);
		}

		this.current_timing.end = now();
		this.stack.pop();
		this.current_timing = this.stack[this.stack.length - 1];
		this.current_children = this.current_timing ? this.current_timing.children : this.timings;
	}

	render() {
		const timings = Object.assign({
			total: now() - this.start_time
		}, collapse_timings(this.timings));

		return {
			timings
		};
	}
}
