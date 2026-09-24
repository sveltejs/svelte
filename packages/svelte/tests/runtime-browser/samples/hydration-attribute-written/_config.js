import { flushSync } from 'svelte';
import { assert_ok, ok, test } from '../../assert';
import { calls, wrap } from './accessors.js';

const attributes = { disabled: true, hidden: true, tabindex: -1, 'aria-rowindex': 2 };
const until_found = { hidden: 'until-found' };

/** @type {Record<string, any>} */
const props = {
	to_true: { hidden: true },
	to_false: { hidden: false },
	kept: until_found,
	translate: false,
	draggable: false,
	observed: {
		retained: { is: 'observed-button', ...attributes },
		// `is` comes last, so the other attributes are hydrated while it is missing
		removed: { ...attributes, is: 'observed-button' },
		unset: { is: undefined, ...attributes }
	},
	native: {
		retained: { is: 'native-prototype-button', ...attributes },
		removed: { ...attributes, is: 'native-prototype-button' }
	},
	named: {
		retained: { is: 'named-form', 'data-n': 1 },
		removed: { 'data-n': 1, is: 'named-form' }
	},
	late: {
		retained: { is: 'late-button', ...attributes },
		removed: { ...attributes, is: 'late-button' }
	},
	same: { is: 'same-string-button', tabindex: '-1', 'aria-rowindex': '2', 'data-state': 'on' }
};

/** @type {string[]} */
const changes = [];

/**
 * @param {typeof HTMLElement} base
 * @param {string[]} observed
 * @param {boolean} [values]
 */
function observe(base, observed, values) {
	return class extends base {
		static observedAttributes = observed;

		/**
		 * @param {string} name
		 * @param {string | null} old_value
		 * @param {string | null} value
		 */
		attributeChangedCallback(name, old_value, value) {
			const label = this.textContent || this.getAttribute('data-case');
			changes.push(values ? `${label} ${name} ${old_value} ${value}` : `${label} ${name}`);
		}
	};
}

/** @param {string} text */
function find(text) {
	const element = [...document.querySelectorAll('main *')].find((e) => e.textContent === text);
	assert_ok(element);
	return /** @type {any} */ (element);
}

/** @param {HTMLCanvasElement} canvas */
function alpha(canvas) {
	return canvas.getContext('2d')?.getImageData(0, 0, 1, 1).data[3];
}

/** @type {MutationObserver} */
let observer;

/** @type {Array<{ element: any, attribute: string, item: { value: number } }>} */
let lists;

/** @type {number[]} */
let errors;

const svg_lists = [
	['text', 'x'],
	['tspan', 'dy'],
	['text', 'rotate'],
	['feColorMatrix', 'values'],
	['feFuncR', 'tableValues'],
	['feConvolveMatrix', 'kernelMatrix']
];

export default test({
	mode: ['hydrate'],

	server_props: {
		...props,
		to_true: until_found,
		to_false: until_found,
		translate: undefined,
		draggable: undefined,
		observed: { ...props.observed, unset: props.observed.retained }
	},

	props,

	before_test() {
		const target = document.querySelector('main');
		assert_ok(target);

		for (const element of target.querySelectorAll('#spread [disabled]')) {
			element.setAttribute('disabled', 'disabled');
		}

		for (const element of target.querySelectorAll('#accessors div')) {
			element.setAttribute('hidden', 'hidden');
		}

		for (const [selector, name] of [
			['main > svg', 'hidden'],
			['main > button', 'disabled']
		]) {
			Object.defineProperty(target.querySelector(selector), name, {
				/** @param {boolean} value */
				set(value) {
					this.setAttribute('data-effect', String(value));
				}
			});
		}

		wrap('wrapped');

		for (const canvas of target.querySelectorAll('canvas')) {
			const context = canvas.getContext('2d');
			assert_ok(context);
			context.fillRect(0, 0, 1, 1);
			ok(alpha(canvas) === 255);
		}

		lists = svg_lists.map(([name, attribute]) => {
			const element = /** @type {any} */ (target.querySelector(name));
			return { element, attribute, item: element[attribute].baseVal.getItem(0) };
		});

		// on `about:blank` no image can load, and each has reported its error already
		const images = [...target.querySelectorAll('image')];
		errors = images.map(() => 0);
		images.forEach((image, i) => image.addEventListener('error', () => errors[i]++));

		const ObservedButton = observe(HTMLButtonElement, Object.keys(attributes));
		const Inherited = observe(HTMLButtonElement, ['data-n']);
		const Own = observe(HTMLButtonElement, ['data-n']);
		const NativePrototypeButton = observe(HTMLButtonElement, Object.keys(attributes));
		const SameStringButton = observe(HTMLButtonElement, [
			'tabindex',
			'aria-rowindex',
			'data-state'
		]);
		const NamedForm = observe(HTMLFormElement, ['data-n']);

		customElements.define('observed-button', ObservedButton, { extends: 'button' });
		customElements.define('inherited-namespace-button', Inherited, { extends: 'button' });
		customElements.define('own-namespace-button', Own, { extends: 'button' });
		customElements.define('native-prototype-button', NativePrototypeButton, { extends: 'button' });
		customElements.define('same-string-button', SameStringButton, { extends: 'button' });
		customElements.define('named-form', NamedForm, { extends: 'form' });

		const upgraded = {
			retained: ObservedButton,
			removed: ObservedButton,
			unset: ObservedButton,
			inherited: Inherited,
			'own-namespace': Own,
			'native-retained': NativePrototypeButton,
			'native-removed': NativePrototypeButton,
			same: SameStringButton
		};

		for (const [text, constructor] of Object.entries(upgraded))
			ok(find(text) instanceof constructor);
		for (const form of target.querySelectorAll('form')) ok(form instanceof NamedForm);

		// an upgraded element stays custom without `is`
		for (const element of [find('removed'), find('native-removed'), find('late-removed')]) {
			element.removeAttribute('is');
		}
		for (const form of target.querySelectorAll('[data-case]:not([data-case=form-retained])')) {
			form.removeAttribute('is');
		}

		const SVG = 'http://www.w3.org/2000/svg';
		Object.defineProperty(Inherited.prototype, 'namespaceURI', { get: () => SVG });
		Object.defineProperty(find('own-namespace'), 'namespaceURI', { value: SVG });
		ok(find('inherited').namespaceURI === SVG && find('own-namespace').namespaceURI === SVG);

		for (const text of ['native-retained', 'native-removed']) {
			Object.setPrototypeOf(find(text), HTMLButtonElement.prototype);
		}

		changes.length = 0;

		observer = new MutationObserver(() => {});
		observer.observe(/** @type {Element} */ (target.querySelector('#spread')), {
			attributes: true,
			subtree: true
		});
	},

	async test({ assert, component, target }) {
		// spread `disabled` and `hidden` always use their setters
		assert.deepEqual(
			observer
				.takeRecords()
				.map((record) => `${record.target.nodeName.toLowerCase()} ${record.attributeName}`),
			[
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
			]
		);
		observer.disconnect();

		for (const name of [
			'button',
			'fieldset',
			'input',
			'optgroup',
			'option',
			'select',
			'textarea'
		]) {
			const element = /** @type {HTMLButtonElement} */ (target.querySelector(`#spread ${name}`));
			assert.equal(element.disabled, true);
			assert.equal(element.getAttribute('disabled'), '');
		}

		assert.equal(target.querySelector('#spread div')?.getAttribute('disabled'), 'true');

		const [to_true, to_false, kept] = target.querySelectorAll('#spread p');
		assert.equal(to_true.getAttribute('hidden'), '');
		assert.equal(to_false.hasAttribute('hidden'), false);
		assert.equal(kept.getAttribute('hidden'), 'until-found');

		assert.equal(target.querySelector('main > svg')?.getAttribute('data-effect'), 'true');
		assert.equal(target.querySelector('main > button')?.getAttribute('data-effect'), 'true');

		assert.deepEqual(calls, [
			'wrapped early disabled true',
			'wrapped early hidden true',
			'replaced late disabled true',
			'wrapped late disabled true',
			'replaced late hidden true',
			'wrapped late hidden true',
			'own-while-hydrating true'
		]);

		for (const div of target.querySelectorAll('#accessors div')) {
			assert.equal(div.getAttribute('hidden'), '');
		}

		// `translate` and `draggable` already read `false`
		const div = /** @type {HTMLElement} */ (target.querySelector('[translate] > div'));
		const a = /** @type {HTMLElement} */ (target.querySelector('a'));
		assert.equal(div.getAttribute('translate'), 'no');
		assert.equal(a.getAttribute('draggable'), 'false');

		flushSync(() => component.$set({ parent: 'yes', href: '#top' }));
		assert.equal(div.translate, false);
		assert.equal(a.draggable, false);

		// a canvas dimension write resets the bitmap
		for (const canvas of target.querySelectorAll('canvas')) {
			assert.equal(alpha(canvas), 0);
			assert.equal(canvas.width, 30);
			assert.equal(canvas.height, 30);
		}

		// a list attribute write detaches the items retrieved before it
		assert.deepEqual(
			lists.map(({ element, attribute, item }) => {
				item.value = 2;
				return [
					element.localName,
					attribute,
					item.value,
					element.getAttribute(attribute),
					element[attribute].baseVal.getItem(0).value
				];
			}),
			svg_lists.map(([name, attribute]) => [name, attribute, 2, '1', 1])
		);

		// a URL write resolves it again
		const start = performance.now();
		while (errors.some((count) => count === 0) && performance.now() - start < 2000) {
			await new Promise((resolve) => setTimeout(resolve, 10));
		}
		await new Promise((resolve) => setTimeout(resolve, 100));
		assert.deepEqual(errors, [1, 1, 1, 1, 1, 1]);

		// with the native prototype, a customized built-in is compared as native (a known limitation)
		assert.deepEqual(
			changes.splice(0).sort(),
			[
				...['retained', 'removed', 'unset'].flatMap((text) =>
					Object.keys(attributes).map((name) => `${text} ${name}`)
				),
				'inherited data-n',
				'own-namespace data-n',
				'native-retained disabled',
				'native-retained hidden',
				'native-removed disabled',
				'native-removed hidden',
				'form-retained data-n',
				'form-removed data-n',
				'form-local-name data-n'
			].sort()
		);

		for (const text of ['retained', 'removed', 'unset']) {
			const button = find(text);
			assert.equal(button.disabled, true);
			assert.equal(button.hidden, true);
			assert.equal(button.tabIndex, -1);
			assert.equal(button.getAttribute('aria-rowindex'), '2');
		}
		assert.equal(find('unset').hasAttribute('is'), false);

		flushSync(() =>
			component.$set({
				native: { ...props.native, retained: { ...props.native.retained, tabindex: 0 } },
				same: { ...props.same, 'data-state': 'off' }
			})
		);
		assert.deepEqual(changes.splice(0).sort(), ['native-retained tabindex', 'same data-state']);

		// defined after hydration, which wrote to plain buttons
		customElements.define(
			'late-button',
			observe(HTMLButtonElement, Object.keys(attributes), true),
			{
				extends: 'button'
			}
		);
		assert.deepEqual(
			changes.splice(0).sort(),
			['late-removed', 'late-retained'].flatMap((text) => [
				`${text} aria-rowindex null 2`,
				`${text} disabled null `,
				`${text} hidden null `,
				`${text} tabindex null -1`
			])
		);

		flushSync(() =>
			component.$set({
				late: {
					retained: { ...props.late.retained, tabindex: 0 },
					removed: { ...props.late.removed, disabled: false }
				}
			})
		);
		assert.deepEqual(changes.sort(), [
			'late-removed disabled  null',
			'late-retained tabindex -1 0'
		]);
	}
});
