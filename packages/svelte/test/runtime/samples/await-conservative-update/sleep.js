export let stopped = false;

export const stop = () => (stopped = true);

export const sleep = (ms) =>
	new Promise((f) => {
		if (stopped) return;
		setTimeout(() => {
			if (stopped) return;
			f();
		}, ms);
	});
