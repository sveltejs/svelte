import { flushSync } from '../../../../src/index-client';
import { test } from '../../test';

export default test({
	html: `<div>href: https://svelte.dev/repl/hello-world?version=5.0</div><div>host: svelte.dev</div><div>pathname: /repl/hello-world</div><div>search: ?version=5.0</div><div>version: 5.0</div><div>t:</div><button>update hostname</button><button>update pathname</button><button>update search</button><button>update href</button>`,

	test({ assert, target }) {
		const [btn, btn2, btn3, btn4] = target.querySelectorAll('button');

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<div>href: https://kit.svelte.dev/repl/hello-world?version=5.0</div><div>host: kit.svelte.dev</div><div>pathname: /repl/hello-world</div><div>search: ?version=5.0</div><div>version: 5.0</div><div>t:</div><button>update hostname</button><button>update pathname</button><button>update search</button><button>update href</button>`
		);

		flushSync(() => {
			btn2?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<div>href: https://kit.svelte.dev/docs/introduction?version=5.0</div><div>host: kit.svelte.dev</div><div>pathname: /docs/introduction</div><div>search: ?version=5.0</div><div>version: 5.0</div><div>t:</div><button>update hostname</button><button>update pathname</button><button>update search</button><button>update href</button>`
		);

		flushSync(() => {
			btn3?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<div>href: https://kit.svelte.dev/docs/introduction?t=123</div><div>host: kit.svelte.dev</div><div>pathname: /docs/introduction</div><div>search: ?t=123</div><div>version:</div><div>t: 123</div><button>update hostname</button><button>update pathname</button><button>update search</button><button>update href</button>`
		);

		flushSync(() => {
			btn4?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<div>href: https://google.com/search?version=3</div><div>host: google.com</div><div>pathname: /search</div><div>search: ?version=3</div><div>version: 3</div><div>t:</div><button>update hostname</button><button>update pathname</button><button>update search</button><button>update href</button>`
		);
	}
});
