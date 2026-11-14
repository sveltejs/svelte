import { tick } from 'svelte';
import { test } from '../../test';

let release = () => {};
/** @type {Array<string | undefined>} */
const asked = [];

// `leave()` takes the {#if} branch away and waits for what replaces it.
// `refresh()` shares a change with it. The later update runs as if the
// held-back one had already happened, but it still re-runs the outgoing await,
// which the held-back update is about to take away, with
// `project === undefined`.
export default test({
	mode: ['client'],
	props: {
		/** @param {number} n */
		slow: (n) => (n ? new Promise((done) => (release = () => done(n))) : 0),
		/** @param {string | undefined} name @param {number} shared */
		ask: async (name, shared) => {
			asked.push(name);
			return `${name} ${shared}`;
		}
	},
	async test({ assert, target }) {
		await tick();
		const [leave, refresh, restore] = target.querySelectorAll('button');
		assert.htmlEqual(
			target.innerHTML,
			'<button>leave</button><button>refresh</button><button>restore</button><span>Garden 0</span>'
		);

		leave.click();
		await tick();
		refresh.click();
		await tick();

		assert.deepEqual(asked, ['Garden']);
		assert.htmlEqual(
			target.innerHTML,
			'<button>leave</button><button>refresh</button><button>restore</button><span>Garden 0</span>'
		);

		release();
		await tick();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>leave</button><button>refresh</button><button>restore</button><span>1</span><p>Inbox 2</p>'
		);
		assert.deepEqual(asked, ['Garden']);

		restore.click();
		await tick();
		assert.deepEqual(asked, ['Garden', 'Garden']);

		leave.click();
		await tick();
		refresh.click();
		await tick();
		assert.deepEqual(asked, ['Garden', 'Garden']);

		// A local unskip must override the inherited skip. Pending work in the
		// now-skipped replacement must not prevent the restored branch committing.
		restore.click();
		await tick();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>leave</button><button>refresh</button><button>restore</button><span>Garden 4</span>'
		);
		assert.ok(asked.every((name) => name === 'Garden'));

		release();
		await tick();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>leave</button><button>refresh</button><button>restore</button><span>Garden 4</span>'
		);
	}
});
