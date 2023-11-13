import { test } from '../../test';

export default test({
	html: '<div>1</div>',
	async test({ assert, component, target }) {
		let div = target.querySelector('div');
		await component.append(2);
		assert.htmlEqual(target.innerHTML, '<div>1</div>');
		assert.strictEqual(div, target.querySelector('div'));

		div = target.querySelector('div');

		component.array = [3, 4];
		assert.htmlEqual(target.innerHTML, '<div>3,4</div>');
		assert.notStrictEqual(div, target.querySelector('div'));
	}
});
