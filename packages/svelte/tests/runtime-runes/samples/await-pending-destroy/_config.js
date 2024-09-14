import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ component, assert, target, logs}) {
		
		// Set a promise on the component
		const p1 = new Promise( (resolve) => setTimeout(resolve, 32) );
		component.promise = p1;
		// And wait the end of the promise
		await p1;
		await Promise.resolve();
		// {#await} and {:then} block must be rendered
		assert.deepEqual(logs, ['await', 'then']);

		// clear logs
		logs.length = 0;

		// Set a promise on the component
		const p2 = new Promise( (resolve) => setTimeout(resolve, 32) );
		component.promise = p2
		// Clear the component's promise
		await Promise.resolve();
		component.promise = null;
		// Wait for the end of the initial promise
		await p2;
		// More wait to avoid scheduling problems
		await new Promise( (resolve) => setTimeout(resolve, 32) );
		// Only {#await} block must be rendered
		assert.deepEqual(logs, ['await']);
	}
});
