import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [btn1, btn2] = [...target.querySelectorAll('custom-element')].map((c) =>
			c.shadowRoot?.querySelector('button')
		);

		btn1?.click();
		await Promise.resolve();
		assert.deepEqual(logs, ['reached shadow root1']);

		btn2?.click();
		await Promise.resolve();
		assert.deepEqual(logs, ['reached shadow root1', 'reached shadow root2']);
	}
});
