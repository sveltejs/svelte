import { assert_ok, test } from '../../assert';

/** @type {MutationObserver} */
let observer;

export default test({
	mode: ['hydrate'],

	before_test() {
		const target = document.querySelector('main');
		assert_ok(target);
		observer = new MutationObserver(() => {});
		observer.observe(target, { attributes: true, subtree: true });
	},

	test({ assert, target }) {
		const written = observer
			.takeRecords()
			.map((record) => `${record.target.nodeName.toLowerCase()} ${record.attributeName}`);
		observer.disconnect();

		// unchanged numbers and booleans aren't written again; the spread's `disabled` and `hidden`
		// go through their property setters, which always run
		assert.deepEqual(written, ['button disabled', 'button hidden']);
		assert.htmlEqual(
			target.innerHTML,
			'<div role="row" aria-rowindex="2" data-active="true"></div> <a href="#top" tabindex="-1">x</a> <svg width="24" height="24" stroke-width="1.5" viewBox="0 0 24 24"></svg> <button disabled hidden tabindex="-1">x</button>'
		);

		const button = target.querySelector('button');
		assert_ok(button);
		assert.equal(button.disabled, true);
		assert.equal(button.hidden, true);
		assert.equal(button.tabIndex, -1);
		assert.equal(button.getAttribute('disabled'), '');
	}
});
