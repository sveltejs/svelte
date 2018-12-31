const tasks = new Set();
let running = false;

function run_tasks() {
	tasks.forEach(task => {
		if (!task[0]()) {
			tasks.delete(task);
			task[1]();
		}
	});

	running = tasks.size > 0;
	if (running) requestAnimationFrame(run_tasks);
}

export function add_task(fn) {
	let task;

	if (!running) {
		running = true;
		requestAnimationFrame(run_tasks);
	}

	return {
		promise: new Promise(fulfil => {
			tasks.add(task = [fn, fulfil]);
		}),
		abort() {
			tasks.delete(task);
		}
	};
}

export function is_date(obj) {
	return Object.prototype.toString.call(obj) === '[object Date]';
}