import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>shift</button><button>true</button><button>false</button><p>pending</p>`,

	async test({ assert, target }) {
		const [shift, t, f] = target.querySelectorAll('button');

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>shift</button><button>true</button><button>false</button><h1>yes</h1>'
		);

		f.click();
		await tick();

		t.click();
		await tick();

		f.click();
		await tick();

		// all three updates write `condition` and therefore share the async
		// effect — they are merged into a single batch, in which the first two
		// in-flight runs are superseded. Only resolving the final run commits
		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>shift</button><button>true</button><button>false</button><h1>yes</h1>'
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>shift</button><button>true</button><button>false</button><h1>yes</h1>'
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>shift</button><button>true</button><button>false</button><h1>no</h1>'
		);
	}
});
