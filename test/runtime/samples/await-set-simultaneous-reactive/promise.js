let _resolvePromise;

export const resolvePromise = () => _resolvePromise();

export const promise = new Promise(resolve => {
	_resolvePromise = resolve();
});
