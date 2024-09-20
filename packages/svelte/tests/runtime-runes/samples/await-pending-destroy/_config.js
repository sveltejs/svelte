import { test } from '../../test';

/**
 * Polyfill for Promise.withResolver()
 * @returns { {promise: Promise<string>, resolve: (value: any)=>void, reject: (reason?: any) => void} }
 */
function promiseWithResolver() {
	let resolve, reject;
	const promise = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});
	// @ts-ignore
	return { promise, resolve, reject };
}

export default test({
	async test({ component, assert, logs }) {
		{
			// Set a promise on the component
			const { promise, resolve } = promiseWithResolver();
			component.promise = promise;
			// wait for rendering
			await Promise.resolve();
			// resolve promise
			resolve('ok');
			// And wait the end of the promise
			await promise;
			// {#await} and {:then} block must be rendered
			assert.deepEqual(logs, ['await', 'then:ok']);
		}

		// clear logs
		logs.length = 0;

		{
			// Set a promise on the component
			const { promise, reject } = promiseWithResolver();
			component.promise = promise;
			// wait for rendering
			await Promise.resolve();
			// reject promise
			reject('error');
			// And wait the end of the promise
			await promise.catch((ignore) => {});
			// {#await} and {:catch} block must be rendered
			assert.deepEqual(logs, ['await', 'catch:error']);
		}

		// clear logs
		logs.length = 0;

		{
			// Set a promise on the component
			const { promise, resolve } = promiseWithResolver();
			component.promise = promise;
			// wait for rendering
			await Promise.resolve();

			// remove the promise
			component.promise = null;
			await Promise.resolve();

			// resolve promise
			resolve('ok');
			// And wait the end of the promise
			await promise;
			// Only {#await} block must be rendered
			assert.deepEqual(logs, ['await']);
		}

		// clear logs
		logs.length = 0;

		{
			// Set a promise on the component
			const { promise, reject } = promiseWithResolver();
			component.promise = promise;
			// wait for rendering
			await Promise.resolve();

			// remove the promise
			component.promise = null;
			await Promise.resolve();

			// reject promise
			reject('error');
			// And wait the end of the promise
			await promise.catch((ignore) => {});
			// Only {#await} block must be rendered
			assert.deepEqual(logs, ['await']);
		}
	}
});
