import { assert_ok, test } from '../../assert';

// [element, attribute]: length lists, then number lists, written directly and in spreads
const cases = [
	['text', 'x'],
	['tspan', 'dy'],
	['text', 'rotate'],
	['feColorMatrix', 'values'],
	['feFuncR', 'tableValues'],
	['feConvolveMatrix', 'kernelMatrix']
];

/** @type {Array<{ element: any, attribute: string, item: { value: number } }>} */
let captured;

export default test({
	mode: ['hydrate'],

	before_test() {
		captured = cases.map(([name, attribute]) => {
			const element = /** @type {any} */ (document.querySelector(`main ${name}`));
			assert_ok(element);
			return { element, attribute, item: element[attribute].baseVal.getItem(0) };
		});
	},

	test({ assert, target }) {
		// writing a list attribute during hydration detaches the items retrieved before it, so changing
		// one afterwards leaves the element's list and attribute unchanged
		const results = captured.map(({ element, attribute, item }) => {
			item.value = 2;
			return [
				element.localName,
				attribute,
				target.querySelector(element.localName) === element,
				item.value,
				element.getAttribute(attribute),
				element[attribute].baseVal.getItem(0).value
			];
		});

		assert.deepEqual(
			results,
			cases.map(([name, attribute]) => [name, attribute, true, 2, '1', 1])
		);
	}
});
