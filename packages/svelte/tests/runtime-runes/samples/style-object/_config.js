import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate', 'server'],

	async test({ assert, target }) {
		const get = (/** @type {string} */ id) =>
			/** @type {HTMLElement} */ (target.querySelector('#' + id));

		// --- inline literal cases ---

		// inline object literal
		assert.equal(get('inline-object').style.color, 'red');
		assert.equal(get('inline-object').style.backgroundColor, 'blue');

		// inline array of strings
		assert.equal(get('inline-array-strings').style.color, 'red');
		assert.equal(get('inline-array-strings').style.backgroundColor, 'blue');

		// inline array mixing strings and objects (and stray trailing semicolons)
		assert.equal(get('inline-array-mixed').style.color, 'red');
		assert.equal(get('inline-array-mixed').style.padding, '4px');
		assert.equal(get('inline-array-mixed').style.margin, '2px');

		// numeric values, including 0
		assert.equal(get('numeric').style.zIndex, '0');
		assert.equal(get('numeric').style.opacity, '1');
		assert.equal(get('numeric').style.lineHeight, '1.5');

		// nested arrays are flattened
		assert.equal(get('nested').style.color, 'red');
		assert.equal(get('nested').style.padding, '4px');
		assert.equal(get('nested').style.margin, '2px');

		// all entries falsy → attribute absent
		assert.equal(get('all-falsy').getAttribute('style'), null);

		// empty object → attribute absent
		assert.equal(get('empty-object').getAttribute('style'), null);

		// conditional inline object: dropped when the gate is false
		assert.equal(get('conditional').style.padding, '4px');
		assert.equal(get('conditional').style.color, '');

		// `false`/null/undefined values inside an object are skipped per-property
		assert.equal(get('falsy-property').style.color, 'red');
		assert.equal(get('falsy-property').style.backgroundColor, '');
		assert.equal(get('falsy-property').style.padding, '');
		assert.equal(get('falsy-property').style.margin, '');

		// reactive cases via direct $state reads: initial render
		assert.equal(get('reactive-object').style.color, 'red');
		assert.equal(get('reactive-object').style.backgroundColor, '');
		assert.equal(get('reactive-array').style.padding, '2px');
		assert.equal(get('reactive-array').style.color, 'red');
		assert.equal(get('reactive-array').style.borderColor, '');

		// CSS custom properties are emitted verbatim
		assert.equal(get('custom-prop').style.getPropertyValue('--my-color'), 'red');
		assert.equal(get('custom-prop').style.getPropertyValue('--scale'), '1');

		// style: directive wins on overlapping property
		assert.equal(get('directive-precedence').style.color, 'blue');
		assert.equal(get('directive-precedence').style.padding, '4px');

		// spread
		assert.equal(get('spread').style.color, 'red');
		assert.equal(get('spread').style.padding, '1px');

		// --- $derived cases ---

		// $derived returning an object
		assert.equal(get('derived-object').style.color, 'red');
		assert.equal(get('derived-object').style.padding, '2px');

		// $derived returning a mixed array
		assert.equal(get('derived-array').style.margin, '2px');
		assert.equal(get('derived-array').style.color, 'red');
		assert.equal(get('derived-array').style.borderWidth, '2px');

		// $derived returning a string
		assert.equal(get('derived-string').style.color, 'red');
		assert.equal(get('derived-string').style.opacity, '1');

		// $derived nested inside an inline array, alongside a literal
		assert.equal(get('derived-in-array').style.outline, '1px solid red');
		assert.equal(get('derived-in-array').style.color, 'red');
		assert.equal(get('derived-in-array').style.padding, '2px');

		// $derived gated by a condition: when falsy, no attribute should be emitted
		assert.notOk(get('derived-conditional').getAttribute('style'));

		// $derived combined with style: directive, directive wins
		assert.equal(get('derived-directive').style.color, 'blue');
		assert.equal(get('derived-directive').style.padding, '2px');

		// $derived inside spread
		assert.equal(get('derived-spread').style.color, 'red');
		assert.equal(get('derived-spread').style.padding, '2px');

		// $derived object with conditional falsy values
		assert.equal(get('derived-falsy').style.color, 'red');
		assert.equal(get('derived-falsy').style.backgroundColor, '');
		assert.equal(get('derived-falsy').style.borderColor, 'black');

		// --- reactivity ---

		const button = /** @type {HTMLButtonElement} */ (target.querySelector('button'));
		button.click();
		flushSync();

		// inline reactive: $state reads recompute
		assert.equal(get('reactive-object').style.color, 'green');
		assert.equal(get('reactive-object').style.backgroundColor, 'yellow');
		assert.equal(get('reactive-array').style.color, 'green');
		assert.equal(get('reactive-array').style.borderColor, 'green');
		assert.equal(get('conditional').style.color, 'green');
		assert.equal(get('custom-prop').style.getPropertyValue('--my-color'), 'green');
		assert.equal(get('directive-precedence').style.color, 'blue'); // still wins
		assert.equal(get('spread').style.color, 'green');

		// $derived cases recompute
		assert.equal(get('derived-object').style.color, 'green');
		assert.equal(get('derived-object').style.padding, '8px');
		assert.equal(get('derived-array').style.color, 'green');
		assert.equal(get('derived-array').style.borderWidth, '8px');
		assert.equal(get('derived-string').style.color, 'green');
		assert.equal(get('derived-string').style.opacity, '0.5');
		assert.equal(get('derived-in-array').style.color, 'green');
		assert.equal(get('derived-in-array').style.padding, '8px');
		// derived-conditional now resolves to a real object
		assert.equal(get('derived-conditional').style.backgroundColor, 'yellow');
		// derived-directive: directive still wins, but padding tracks the derived
		assert.equal(get('derived-directive').style.color, 'blue');
		assert.equal(get('derived-directive').style.padding, '8px');
		assert.equal(get('derived-spread').style.color, 'green');
		assert.equal(get('derived-spread').style.padding, '8px');
		// derived-falsy: now `background-color` shows up and `border-color` drops
		assert.equal(get('derived-falsy').style.color, 'green');
		assert.equal(get('derived-falsy').style.backgroundColor, 'yellow');
		assert.equal(get('derived-falsy').style.borderColor, '');
	}
});
