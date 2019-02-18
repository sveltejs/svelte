const now = (typeof process !== 'undefined' && process.hrtime)
	? () => {
		const t = process.hrtime();
		return t[0] * 1e3 + t[1] / 1e6;
	}
	: () => self.performance.now();

type Timing = {
	label: string;
	start: number;
	end: number;
	children: Timing[];
}

function collapseTimings(timings) {
	const result = {};
	timings.forEach(timing => {
		result[timing.label] = Object.assign({
			total: timing.end - timing.start
		}, timing.children && collapseTimings(timing.children));
	});
	return result;
}

export default class Stats {
	startTime: number;
	currentTiming: Timing;
	currentChildren: Timing[];
	timings: Timing[];
	stack: Timing[];

	constructor() {
		this.startTime = now();
		this.stack = [];
		this.currentChildren = this.timings = [];
	}

	start(label) {
		const timing = {
			label,
			start: now(),
			end: null,
			children: []
		};

		this.currentChildren.push(timing);
		this.stack.push(timing);

		this.currentTiming = timing;
		this.currentChildren = timing.children;
	}

	stop(label) {
		if (label !== this.currentTiming.label) {
			throw new Error(`Mismatched timing labels (expected ${this.currentTiming.label}, got ${label})`);
		}

		this.currentTiming.end = now();
		this.stack.pop();
		this.currentTiming = this.stack[this.stack.length - 1];
		this.currentChildren = this.currentTiming ? this.currentTiming.children : this.timings;
	}

	render() {
		const timings = Object.assign({
			total: now() - this.startTime
		}, collapseTimings(this.timings));

		return {
			timings
		};
	}
}
