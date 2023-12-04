/** @type {import('./types.js').Raf} */
export const raf = {
	tick: /** @param {any} _ */ (_) => requestAnimationFrame(_),
	now: () => performance.now()
};
