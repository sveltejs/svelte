import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	async test({ assert, target }) {
		const [fork, settle, discard, commit] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		await tick();
		assert.htmlEqual(
			output.innerHTML,
			'<p>loading then</p><p>loading catch</p><p>loading rejection</p>'
		);

		// Errors in a forked await block must not trigger the boundary before commit or when discarded
		fork.click();
		settle.click();
		await tick();
		assert.htmlEqual(
			output.innerHTML,
			'<p>loading then</p><p>loading catch</p><p>loading rejection</p>'
		);

		discard.click();
		await tick();
		assert.htmlEqual(
			output.innerHTML,
			'<p>loading then</p><p>loading catch</p><p>loading rejection</p>'
		);

		// Committing a fork whose await branches errored should trigger the boundaries
		fork.click();
		settle.click();
		await tick();
		assert.htmlEqual(
			output.innerHTML,
			'<p>loading then</p><p>loading catch</p><p>loading rejection</p>'
		);

		commit.click();
		await tick();
		assert.htmlEqual(
			output.innerHTML,
			'<p>failed: then</p><p>failed: catch</p><p>failed: rejection</p>'
		);
	}
});
