Promise.withResolvers ??= () => {
	let resolve;
	let reject;

	const promise = new Promise((f, r) => {
		resolve = f;
		reject = r;
	});

	return { promise, resolve, reject };
};

globalThis.delayed = (v, ms = 1000) => {
	return new Promise((f) => {
		setTimeout(() => f(v), ms);
	});
};
