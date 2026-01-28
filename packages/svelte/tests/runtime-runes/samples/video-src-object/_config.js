import { test } from '../../test';

export default test({
	html: `<video></video>`,

	test({ assert, target }) {
		const video = target.querySelector('video');

		// @ts-ignore
		assert.deepEqual(video?.srcObject, {});
	}
});
