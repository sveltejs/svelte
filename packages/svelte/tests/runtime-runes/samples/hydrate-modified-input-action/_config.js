import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['hydrate'],
	props: { unchanged: 'client' },
	server_props: { unchanged: 'server' },

	async test({ assert, target, hydrate }) {
		const sections = target.querySelectorAll('section');
		for (const section of sections) {
			const inputs = section.querySelectorAll('input');
			inputs[0].value = 'typed before hydration';
			inputs[1].value = '42';
			section.querySelectorAll('textarea')[0].value = 'early text';
			inputs[2].checked = true;
			inputs[3].checked = false;
			inputs[4].checked = false;
			inputs[5].checked = true;
			inputs[6].checked = false;
			inputs[7].checked = true;
		}

		hydrate();
		flushSync();

		for (const section of sections) {
			const [input, number, checked, unchecked, radio1, radio2, check1, check2, unchanged] =
				section.querySelectorAll('input');
			const [textarea] = section.querySelectorAll('textarea');
			const [p] = section.querySelectorAll('p');
			assert.equal(input.value, 'typed before hydration');
			assert.equal(number.value, '42');
			assert.equal(textarea.value, 'early text');
			assert.equal(checked.checked, true);
			assert.equal(unchecked.checked, false);
			assert.equal(unchanged.value, 'client');
			assert.deepEqual(JSON.parse(p.textContent ?? ''), [
				'typed before hydration',
				42,
				'early text',
				true,
				false,
				2,
				['b'],
				'client'
			]);

			section.querySelectorAll('button')[0].click();
			await tick();
			assert.equal(input.value, 'updated');
			assert.deepEqual([radio1.checked, radio2.checked], [true, false]);
			assert.deepEqual([check1.checked, check2.checked], [true, false]);

			input.value = 'after hydration';
			input.dispatchEvent(new window.Event('input'));
			await tick();
			assert.equal(JSON.parse(p.textContent ?? '')[0], 'after hydration');
		}
	}
});
