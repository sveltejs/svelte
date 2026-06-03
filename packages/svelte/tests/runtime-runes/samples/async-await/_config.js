import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [reset, one, two, reject] = target.querySelectorAll('button');

		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>reset</button><button>one</button><button>two</button><button>reject</button> waiting'
		);

		one.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>reset</button><button>one</button><button>two</button><button>reject</button> one_res'
		);

		reset.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>reset</button><button>one</button><button>two</button><button>reject</button> waiting'
		);

		two.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>reset</button><button>one</button><button>two</button><button>reject</button> two_res'
		);

		reset.click();
		reject.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>reset</button><button>one</button><button>two</button><button>reject</button> reject_catch'
		);
	}
});
