import { test } from '../../test';

export default test({
	html: `<button>0</button>`,
	async test({ assert, target }) {
		const btn = target.querySelector('button');

		assert.htmlEqual(target.innerHTML, '<button>0</button>');

		await btn?.click();
		assert.htmlEqual(target.innerHTML, '<button>2</button>');

		await btn?.click();
		assert.htmlEqual(target.innerHTML, '<button>4</button>');
	}
});
