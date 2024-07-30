import { test } from '../../test';

export default test({
	async test({ assert, component, target }) {
		/** @param {any} value */
		let resolve = (value) => {};

		/** @param {any} reason */
		let reject = (reason) => {};

		let promise = new Promise((ok) => (resolve = ok));

		component.promise = promise;
		assert.htmlEqual(target.innerHTML, 'Loading...');

		resolve(42);
		await promise;
		assert.htmlEqual(target.innerHTML, '42');

		promise = new Promise((ok, fail) => (reject = fail));
		component.promise = promise;
		assert.htmlEqual(target.innerHTML, 'Loading...');

		reject(99);
		await promise.then(null, () => {});
		assert.htmlEqual(target.innerHTML, '99');

		promise = new Promise((ok) => (resolve = ok));
		component.promise = promise;
		assert.htmlEqual(target.innerHTML, 'Loading...');

		resolve(1);
		await promise;
		assert.htmlEqual(target.innerHTML, '1');
	}
});
