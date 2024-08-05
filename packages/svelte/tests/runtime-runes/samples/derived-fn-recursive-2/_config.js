import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<p>Is even</p><button>clicks: 0</button><button>disable</button>`,

	test({ assert, target }) {
		const [b1, b2] = target.querySelectorAll('button');

		b1?.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, `<p>Is odd</p><button>clicks: 1</button><button>disable</button>`);

		b2?.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, `<p>Is odd</p><button>clicks: 1</button><button>disable</button>`);
	}
});
