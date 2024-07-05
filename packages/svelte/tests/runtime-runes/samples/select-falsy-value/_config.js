import { flushSync } from 'svelte';
import { test } from '../../test';

// <option value> is special because falsy values should result in an empty string value attribute
export default test({
	mode: ['client'],
	test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`
			<select>
				<option value="">Default</option>
			</select>

			<select>
				<option value="">Default</option>
			</select>

			<select>
				<option value="">Default</option>
			</select>

			<select>
				<option value="">Default</option>
			</select>

			<select>
				<option value="">Default</option>
			</select>

			<button>update reactive spread</button>
		`
		);

		const btn = target.querySelector('button');
		btn?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<select>
				<option value="">Default</option>
			</select>

			<select>
				<option value="">Default</option>
			</select>

			<select>
				<option value="">Default</option>
			</select>

			<select>
				<option value="">Default</option>
			</select>

			<select>
				<option>Default</option>
			</select>

			<button>update reactive spread</button>
		`
		);
	}
});
