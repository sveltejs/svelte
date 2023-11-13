import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML =
			'<custom-element camelcase2="Hello" camel-case="world" an-array="[1,2]"></custom-element>';
		await tick();
		/** @type {any} */
		const el = target.querySelector('custom-element');

		assert.htmlEqual(el.shadowRoot.innerHTML, '<h1>Hello world!</h1> <p>1</p><p>2</p>');

		el.setAttribute('camel-case', 'universe');
		el.setAttribute('an-array', '[3,4]');
		el.setAttribute('camelcase2', 'Hi');
		await tick();
		await tick();
		assert.htmlEqual(el.shadowRoot.innerHTML, '<h1>Hi universe!</h1> <p>3</p><p>4</p>');
		assert.htmlEqual(
			target.innerHTML,
			'<custom-element camelcase2="Hi" camel-case="universe" an-array="[3,4]"></custom-element>'
		);

		el.camelCase = 'galaxy';
		el.camelCase2 = 'Hey';
		el.anArray = [5, 6];
		await tick();
		await tick();
		assert.htmlEqual(el.shadowRoot.innerHTML, '<h1>Hey galaxy!</h1> <p>5</p><p>6</p>');
		assert.htmlEqual(
			target.innerHTML,
			'<custom-element camelcase2="Hey" camel-case="universe" an-array="[5,6]"></custom-element>'
		);
	}
});
