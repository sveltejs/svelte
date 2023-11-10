export let stopped = false;

export const stop = () => (stopped = true);

/** @param {number} ms */
export const sleep = (ms) =>
	new Promise((f) => {
		if (stopped) return;
		setTimeout(() => {
			if (stopped) return;
			f(undefined);
		}, ms);
	});
