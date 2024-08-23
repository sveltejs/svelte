import { test } from '../../test';

export default test({
	html: 'Loading...',
	async test({ assert, component, target }) {
		await component.test();

		assert.htmlEqual(target.innerHTML, '1');
		assert.deepEqual(component.logs, ['mount 0', 'unmount 0', 'mount 1']);
	}
});
