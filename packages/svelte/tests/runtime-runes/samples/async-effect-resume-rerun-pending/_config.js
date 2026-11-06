import { tick } from 'svelte';
import { test } from '../../test';

// The counterpart of `async-effect-resume-no-rerun-pending`: what the effect reads does change while
// the branch is paused, so it has to re-run when the branch is resumed
export default test({
	mode: ['client'],
	async test({ assert, target, logs, raf }) {
		await tick();
		const [x, s, toggle, shift, big] = target.querySelectorAll('button');
		assert.deepEqual(logs, ['effect false']);

		// keep an earlier batch pending, so that the next ones commit while time travelling
		x.click();
		await tick();

		s.click();
		await tick();
		assert.deepEqual(logs, ['effect false']);

		// outro
		toggle.click();
		await tick();
		raf.tick(50);

		// `big` changes while the branch is paused
		big.click();
		await tick();
		assert.deepEqual(logs, ['effect false']);

		// reintro before the outro finished: the branch is resumed, and the effect sees the new value
		toggle.click();
		await tick();
		raf.tick(200);

		assert.deepEqual(logs, ['effect false', 'effect true']);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>x</button><button>s</button><button>toggle</button><button>shift</button><button>big</button><p>1</p><div style=""><p>child</p></div>'
		);
		assert.deepEqual(logs, ['effect false', 'effect true']);
	}
});
