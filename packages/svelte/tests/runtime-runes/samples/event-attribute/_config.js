import { test } from '../../test';

export default test({
	html: `<button>0</button><button>0</button>`,

	async test({ assert, target }) {
		const [b1, b2] = target.querySelectorAll('button');

		b1?.click();
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<button>1</button><button>1</button>');

		b2?.click();
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<button>2</button><button>2</button>');
	}
});
