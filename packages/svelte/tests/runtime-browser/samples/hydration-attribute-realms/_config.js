import { assert_ok, test } from '../../assert';

/** @type {string[]} */
const changes = [];

const attributes = { disabled: true, hidden: true, tabindex: -1, 'aria-rowindex': 2 };

/** @type {ShadowRoot} */
let root;

/** @param {typeof HTMLButtonElement} base */
function observed(base) {
	return class extends base {
		static observedAttributes = Object.keys(attributes);

		/** @param {string} name */
		attributeChangedCallback(name) {
			changes.push(`${this.textContent} ${name}`);
		}
	};
}

export default test({
	mode: ['hydrate'],

	props: {
		// hydrated first, so `get_setters` has `BUTTON` cached for the adopted button
		warm: attributes,
		scoped: { is: 'scoped-button', ...attributes },
		adopted: { ...attributes, is: 'realm-button' }
	},

	options: {
		get target() {
			return root;
		}
	},

	before_test() {
		const main = document.querySelector('main');
		assert_ok(main);

		const registry = new CustomElementRegistry();
		registry.define('scoped-button', observed(HTMLButtonElement), { extends: 'button' });

		const markup = main.innerHTML;
		main.innerHTML = '';
		root = main.attachShadow(
			/** @type {any} */ ({ mode: 'open', customElementRegistry: registry })
		);
		root.innerHTML = markup;

		// adopted from another realm, without its `is`
		const iframe = document.createElement('iframe');
		document.body.append(iframe);
		const realm = /** @type {Window & typeof globalThis} */ (iframe.contentWindow);
		realm.customElements.define('realm-button', observed(realm.HTMLButtonElement), {
			extends: 'button'
		});

		const button = root.querySelectorAll('button')[2];
		realm.document.body.innerHTML = button.outerHTML;
		const adopted = /** @type {HTMLButtonElement} */ (realm.document.body.firstChild);
		button.replaceWith(adopted);
		adopted.removeAttribute('is');

		changes.length = 0;
	},

	test({ assert }) {
		assert.deepEqual(
			changes.sort(),
			['adopted', 'scoped'].flatMap((button) =>
				['aria-rowindex', 'disabled', 'hidden', 'tabindex'].map((name) => `${button} ${name}`)
			)
		);

		for (const button of root.querySelectorAll('button')) {
			assert.equal(button.disabled, true);
			assert.equal(button.tabIndex, -1);
		}
	}
});
