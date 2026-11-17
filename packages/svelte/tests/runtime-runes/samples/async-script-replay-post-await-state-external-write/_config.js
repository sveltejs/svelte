import { tick } from 'svelte';
import { test } from '../../test';

// An external callback edits state created after an await while a later await
// is still pending. The new attempt must rerun the first checkpoint, then apply
// that explicit logical-slot write before its following snapshot reads the state.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [first_start, write, replacement_start, replacement_value, old_value] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		await tick();
		assert.htmlEqual(output.innerHTML, 'pending');
		assert.deepEqual(logs.splice(0), ['prefix', 'load start 0 #0']);

		first_start.click();
		await tick();
		assert.htmlEqual(output.innerHTML, 'pending');
		assert.deepEqual(logs.splice(0), ['state 0/0', 'load value 0 #0']);

		write.click();
		await tick();
		assert.htmlEqual(output.innerHTML, 'pending');
		assert.deepEqual(logs.splice(0), ['prefix', 'load start 0 #1']);

		replacement_start.click();
		await tick();
		assert.htmlEqual(output.innerHTML, 'pending');
		assert.deepEqual(logs.splice(0), ['state 1/1', 'load value 1 #0']);

		replacement_value.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>1|1|1</p>');
		assert.deepEqual(logs, []);
		const [node] = output.querySelectorAll('p');

		old_value.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>1|1|1</p>');
		assert.equal(output.querySelector('p'), node);
		assert.deepEqual(logs, [], 'an old post-await source must not overwrite the replacement');
	}
});
