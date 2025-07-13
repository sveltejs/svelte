import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>reset</button><button>true</button><button>false</button><p>pending</p>`,

	async test({ assert, target }) {
		const [reset, t, f] = target.querySelectorAll('button');

		t.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>reset</button><button>true</button><button>false</button><h1>yes</h1>'
		);

		reset.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>reset</button><button>true</button><button>false</button><h1>yes</h1>'
		);

		f.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>reset</button><button>true</button><button>false</button><h1>no</h1>'
		);
	}
});
