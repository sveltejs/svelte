import { tick } from 'svelte';
import { test } from '../../test';

// Like `async-effect-resume-no-rerun`, but the earlier batch is still pending when the branch is paused and
// resumed. It re-validates the effect when it's rebased, but the effect is paused, so it isn't checked
export default test({
	mode: ['client'],
	async test({ assert, target, logs, raf }) {
		await tick();
		const [x, s, toggle, shift] = target.querySelectorAll('button');
		assert.deepEqual(logs, ['effect false']);

		// keep an earlier batch pending, so that the next ones commit while time travelling
		x.click();
		await tick();

		// `big` stays `false`, so the effect must not re-run
		s.click();
		await tick();
		assert.deepEqual(logs, ['effect false']);

		// outro, then reintro before the outro finished: the branch is resumed
		toggle.click();
		await tick();
		raf.tick(50);
		toggle.click();
		await tick();
		raf.tick(200);
		assert.deepEqual(logs, ['effect false']);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>x</button><button>s</button><button>toggle</button><button>shift</button><p>1</p><div style=""><p>child</p></div>'
		);
		assert.deepEqual(logs, ['effect false']);
	}
});
