import { flushSync } from 'svelte';
import { test } from '../../assert';

let hydrating = false;

export default test({
	mode: ['hydrate'],

	before_test() {
		const [input, files] = document.querySelectorAll('input');
		hydrating = !!input;
		if (!hydrating) return;
		input.value = 'before hydration';
		const transfer = new DataTransfer();
		transfer.items.add(new File(['contents'], 'early.txt'));
		files.files = transfer.files;
	},

	test({ assert, target, window }) {
		const [input, files] = target.querySelectorAll('input');
		const [value, filename] = target.querySelectorAll('p');
		assert.equal(input.value, hydrating ? 'before hydration' : '');
		assert.equal(files.files?.length, hydrating ? 1 : 0);
		assert.equal(value.textContent, hydrating ? 'before hydration' : '');
		assert.equal(filename.textContent, hydrating ? 'early.txt' : '');

		const transfer = new DataTransfer();
		transfer.items.add(new File(['contents'], 'later.txt'));
		files.files = transfer.files;
		files.dispatchEvent(new window.Event('change'));
		flushSync();
		assert.equal(filename.textContent, 'later.txt');

		target.querySelector('button')?.click();
		flushSync();
		assert.equal(files.files?.length, 0);
		assert.equal(filename.textContent, '');
	}
});
