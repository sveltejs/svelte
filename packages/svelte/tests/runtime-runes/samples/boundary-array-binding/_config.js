export default {
	// 🔴 THIS IS THE KEY: Force production mode to trigger the bug
	compileOptions: {
        dev: false,
        immutable: true // strict mode
    },
	async test({ assert, target, window }) {
		// 1. Wait for the async await block to resolve
		await Promise.resolve();
		await Promise.resolve();

		const input = target.querySelector('input');
		const p = target.querySelector('p');

		// 2. Simulate user typing "updated"
		input.value = 'updated';
		input.dispatchEvent(new window.Event('input'));
		
		// 3. Wait for reactivity
		await Promise.resolve();

		// 4. Assert
		assert.equal(p.innerHTML, 'Value: updated');
	}
};