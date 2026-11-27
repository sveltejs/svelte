import { test } from '../../assert';
const tick = () => new Promise((resolve) => setTimeout(resolve));

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<custom-element></custom-element>';
		await tick();

		/** @type {any} */
		const el = target.querySelector('custom-element');
		/** @type {any} */
		const counter = el.shadowRoot.querySelector('my-counter');
		const [output, mode_output] = el.shadowRoot.querySelectorAll('output');
		const add_ten = el.shadowRoot.querySelector('button.add-ten');
		const push = el.shadowRoot.querySelector('button.push');

		await tick();
		const increment = counter.shadowRoot.querySelector('button.increment');
		const add = counter.shadowRoot.querySelector('button.add');

		// parent -> child
		assert.equal(increment.textContent, 'count: 1');
		assert.equal(counter.getAttribute('count'), '1');
		assert.equal(output.textContent, '1 ');

		// an assignment during initialization reaches the parent once the component has been created
		assert.equal(counter.mode, 'auto');
		assert.equal(mode_output.textContent, 'auto');

		/** @type {any[]} */
		const events = [];
		counter.addEventListener('countchange', (/** @type {CustomEvent} */ e) =>
			events.push(['count', e.detail])
		);
		// the casing of the prop name is preserved
		counter.addEventListener('itemListchange', (/** @type {CustomEvent} */ e) =>
			events.push(['itemList', [...e.detail]])
		);

		// child -> parent: assigning to a bindable prop dispatches a `<name>change` event
		increment.click();
		await tick();
		assert.equal(increment.textContent, 'count: 2');
		assert.equal(counter.getAttribute('count'), '2');
		assert.equal(output.textContent, '2 ');
		assert.deepEqual(events, [['count', 2]]);

		// parent -> child: changes from the outside don't dispatch events
		add_ten.click();
		await tick();
		assert.equal(output.textContent, '12 ');
		assert.equal(increment.textContent, 'count: 12');
		assert.deepEqual(events, [['count', 2]]);

		// same for setting the property or attribute directly
		counter.count = 20;
		counter.setAttribute('count', '21');
		await tick();
		assert.equal(increment.textContent, 'count: 21');
		assert.deepEqual(events, [['count', 2]]);

		increment.click();
		await tick();
		assert.equal(output.textContent, '22 ');
		assert.deepEqual(events, [
			['count', 2],
			['count', 22]
		]);

		// objects
		add.click();
		await tick();
		assert.equal(add.textContent.trim(), '0');
		assert.equal(output.textContent, '22 0');
		assert.deepEqual(events, [
			['count', 2],
			['count', 22],
			['itemList', [0]]
		]);

		// the bound value is deeply reactive in the parent (and shared with the child)
		push.click();
		await tick();
		assert.equal(output.textContent, '22 0,x');
		assert.equal(add.textContent.trim(), '0,x');
		assert.equal(events.length, 3);
	}
});
