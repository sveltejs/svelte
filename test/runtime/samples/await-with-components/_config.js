export default {
	async test({ assert, component, target }) {
		let resolve;
		let reject;
		let promise = new Promise(ok => resolve = ok);

		component.promise = promise;
		assert.htmlEqual(target.innerHTML, 'Loading...');

		resolve(42);
		await promise;
		assert.htmlEqual(target.innerHTML, '42');

		promise = new Promise((ok, fail) => reject = fail);
		component.promise = promise;
		assert.htmlEqual(target.innerHTML, 'Loading...');

		reject(99);
		await promise.then(null, () => {});
		assert.htmlEqual(target.innerHTML, '99');

		promise = new Promise(ok => resolve = ok);
		component.promise = promise;
		assert.htmlEqual(target.innerHTML, 'Loading...');

		resolve(1);
		await promise;
		assert.htmlEqual(target.innerHTML, '1');
	}
};
