import { test } from '../../test';

export default test({
	html: '<div>000</div>',
	async test({ assert, component, target }) {
		let div = target.querySelector('div');
		component.value = 2;
		assert.htmlEqual(target.innerHTML, '<div>200</div>');
		assert.notStrictEqual(div, target.querySelector('div'));

		div = target.querySelector('div');

		component.anotherValue = 5;
		assert.htmlEqual(target.innerHTML, '<div>250</div>');
		assert.notStrictEqual(div, target.querySelector('div'));

		div = target.querySelector('div');

		component.thirdValue = 9;
		assert.htmlEqual(target.innerHTML, '<div>259</div>');
		assert.strictEqual(div, target.querySelector('div'));
	}
});
