import { tick } from 'svelte';
import { ok, test } from '../../assert';

export default test({
	async test({ assert, target }) {
		const input = target.querySelector('input');
		const elements = target.querySelectorAll('progress[max], meter');
		ok(input);

		// A missing progress value also reads as zero, but means indeterminate progress.
		for (const progress of target.querySelectorAll('progress:not([max])')) {
			assert.equal(progress.getAttribute('value'), '0');
			assert.equal(/** @type {HTMLProgressElement} */ (progress).position, 0);
		}

		input.value = '11';
		input.dispatchEvent(new window.Event('input'));
		await tick();

		// The getters are clamped to max, but the attributes must also reflect the updated state.
		for (const element of elements) {
			assert.equal(element.getAttribute('value'), '11');
		}

		input.value = '14';
		input.dispatchEvent(new window.Event('input'));
		await tick();

		for (const element of elements) {
			assert.equal(/** @type {HTMLProgressElement | HTMLMeterElement} */ (element).value, 11);
		}
	}
});
