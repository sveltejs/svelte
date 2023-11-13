import { test } from '../../test';

export default test({
	skip_if_hydrate: 'permanent', // unnecessary to test
	skip_if_ssr: 'permanent', // unnecessary to test

	async test({ assert, target }) {
		const [b1, b2] = target.querySelectorAll('button');

		b1?.click();
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<button>Count: 1</button><button>Increment</button>');

		b2?.click();
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<button>Count: 2</button><button>Increment</button>');
	}
});
