import { tick } from 'svelte';
import { test } from '../../test';

// An async expression that rejects in a fork has the error as its value in the fork, which the commit
// writes to the real world. Before, the error was flagged in the real world right away, but its value
// was never written anywhere, so the committed fork threw the expression's previous value (`UNINITIALIZED`)
export default test({
	async test({ assert, target }) {
		const [show, commit] = target.querySelectorAll('button');

		show.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>show</button><button>commit</button>');

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>show</button><button>commit</button> failed: boom');
	}
});
