import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, component }) {
		const [b1, b2] = target.querySelectorAll('button');
		assert.htmlEqual(
			target.innerHTML,
			'<div>5</div><div>5</div><div>3</div><button>set null</button><button>set object</button'
		);
		flushSync(() => {
			b2.click();
		});
		assert.htmlEqual(
			target.innerHTML,
			'<div>5</div><div>5</div><div>3</div><button>set null</button><button>set object</button'
		);
		flushSync(() => {
			b1.click();
		});
		assert.htmlEqual(
			target.innerHTML,
			'<div>5</div><div></div><div>3</div><button>set null</button><button>set object</button'
		);
	}
});
