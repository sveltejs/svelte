import { flushSync } from '../../../../src/index-client.js';
import { test } from '../../test';

export default test({
	test({ target }) {
		const button = /** @type {HTMLButtonElement} */ (target.querySelector('button'));
		const audio = /** @type {HTMLAudioElement} */ (target.querySelector('audio'));

		flushSync(() => button.click());
		audio.currentTime = 1;
		audio.dispatchEvent(new Event('timeupdate'));
	}
});
