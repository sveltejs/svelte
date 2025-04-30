import { test } from '../../test';

export default test({
	test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`<button>a</button><button>b</button><button>c</button><button>d</button>`
		);
	}
});
