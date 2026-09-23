import { deepEqual, ok, test } from '../../assert';

/** @type {string[]} */
const changes = [];

const SVG = 'http://www.w3.org/2000/svg';

export default test({
	mode: ['hydrate'],

	before_test() {
		/** @param {string} name */
		const define = (name) => {
			class ObservedButton extends HTMLButtonElement {
				static observedAttributes = ['data-n'];

				/** @param {string} name */
				attributeChangedCallback(name) {
					changes.push(`${this.textContent} ${name}`);
				}
			}

			customElements.define(name, ObservedButton, { extends: 'button' });
			return ObservedButton;
		};

		// one class reports an SVG namespace from its prototype, the other instance from an own property
		const Inherited = define('inherited-namespace-button');
		Object.defineProperty(Inherited.prototype, 'namespaceURI', { get: () => SVG });
		const Own = define('own-namespace-button');

		const [inherited, own] = document.querySelectorAll('main button');
		Object.defineProperty(own, 'namespaceURI', { value: SVG });

		// the server-rendered buttons were upgraded and reported their existing attribute
		ok(inherited instanceof Inherited && own instanceof Own);
		ok(inherited.namespaceURI === SVG && own.namespaceURI === SVG);
		deepEqual(changes.length, 2);
		changes.length = 0;
	},

	test({ assert }) {
		// the actual namespace is HTML, so both are compared by prototype and still observe the write
		assert.deepEqual(changes.sort(), ['inherited data-n', 'own data-n']);
	}
});
