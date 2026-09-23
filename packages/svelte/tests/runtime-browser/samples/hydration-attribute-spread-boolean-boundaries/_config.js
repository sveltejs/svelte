import { assert_ok, test } from '../../assert';

/** @type {MutationObserver} */
let observer;

const until_found = { hidden: 'until-found' };

export default test({
	mode: ['hydrate'],

	server_props: { to_true: until_found, to_false: until_found, kept: until_found },
	props: { to_true: { hidden: true }, to_false: { hidden: false }, kept: until_found },

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

		// spread `disabled` and `hidden` always go through their property setters
		assert.deepEqual(written, [
			'button disabled',
			'fieldset disabled',
			'input disabled',
			'select disabled',
			'optgroup disabled',
			'option disabled',
			'textarea disabled',
			'div disabled',
			'p hidden',
			'p hidden'
		]);

		for (const name of [
			'button',
			'fieldset',
			'input',
			'optgroup',
			'option',
			'select',
			'textarea'
		]) {
			const element = /** @type {HTMLButtonElement} */ (target.querySelector(name));
			assert.equal(element.disabled, true);
			assert.equal(element.getAttribute('disabled'), '');
		}

		assert.equal(target.querySelector('div')?.getAttribute('disabled'), 'true');

		const [to_true, to_false, kept] = target.querySelectorAll('p');
		assert.equal(to_true.getAttribute('hidden'), '');
		assert.equal(to_false.hasAttribute('hidden'), false);
		assert.equal(kept.getAttribute('hidden'), 'until-found');
	}
});
