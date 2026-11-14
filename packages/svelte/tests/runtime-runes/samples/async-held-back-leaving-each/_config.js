import { tick } from 'svelte';
import { test } from '../../test';

/** @type {Array<() => void>} */
const releases = [];
/** @type {Array<string | undefined>} */
const asked = [];

export default test({
	mode: ['client'],
	props: {
		/** @param {number} n */
		slow: (n) => (n ? new Promise((done) => releases.push(() => done(n))) : 0),
		/** @param {string | undefined} name @param {number} shared @param {number} independent */
		ask: async (name, shared, independent) => {
			asked.push(name);
			return `${name} ${shared} ${independent}`;
		}
	},
	async test({ assert, target }) {
		await tick();
		const [leave, refresh_both, refresh, independent] = target.querySelectorAll('button');
		const buttons =
			'<button>leave</button><button>refresh both</button><button>refresh</button><button>independent</button>';
		assert.htmlEqual(target.innerHTML, buttons + '<span>Garden 0 0</span><p>0</p>');

		leave.click();
		await tick();
		// This later batch is itself deferred. Its inherited skip must not leave
		// shared traversal markers behind and prevent the next batch from running.
		refresh_both.click();
		await tick();
		refresh.click();
		await tick();
		assert.deepEqual(asked, ['Garden']);
		assert.htmlEqual(target.innerHTML, buttons + '<span>Garden 0 0</span><p>0</p>');

		// An unrelated batch still sees the old project and must be able to
		// traverse the outgoing branch after the inherited skip.
		independent.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons + '<span>Garden 0 1</span><p>0</p>');
		assert.deepEqual(asked, ['Garden', 'Garden']);

		// The newer result supersedes the older pending invocation.
		releases[1]();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons + '<p>2</p>');

		releases[0]();
		await tick();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons + '<p>2</p>');
		assert.deepEqual(asked, ['Garden', 'Garden']);
	}
});
