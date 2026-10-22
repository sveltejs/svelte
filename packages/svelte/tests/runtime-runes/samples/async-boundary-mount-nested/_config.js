import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, instance, logs }) {
		const [inner, outer, reset] = target.querySelectorAll('button');
		/**
		 * @param {string} name
		 * @param {string | null} [previous]
		 */
		const expect_logs = (name, previous = null) => {
			assert.deepEqual(logs, [
				...(previous === null ? [] : [`unmount ${previous}`, `cleanup ${previous}`]),
				`mount ${name}: true`,
				`effect ${name}: true`
			]);
			logs.length = 0;
		};

		await tick();
		expect_logs('outer pending');

		// Resolving the inner boundary must not run effects while the outer one is pending.
		inner.click();
		await tick();
		assert.deepEqual(logs, []);
		assert.htmlEqual(
			target.innerHTML,
			'<button>inner</button><button>outer</button><button>reset</button><div>outer pending</div>'
		);

		outer.click();
		await tick();
		expect_logs('inner', 'outer pending');
		assert.htmlEqual(
			target.innerHTML,
			'<button>inner</button><button>outer</button><button>reset</button><div>inner</div><p>outer</p>'
		);

		reset.click();
		await tick();
		expect_logs('outer pending', 'inner');

		// In the opposite order, the inner pending snippet is visible and its effects should run.
		outer.click();
		await tick();
		expect_logs('inner pending', 'outer pending');
		assert.htmlEqual(
			target.innerHTML,
			'<button>inner</button><button>outer</button><button>reset</button><div>inner pending</div><p>outer</p>'
		);

		inner.click();
		await tick();
		expect_logs('inner', 'inner pending');

		reset.click();
		await tick();
		expect_logs('outer pending', 'inner');

		inner.click();
		await tick();
		assert.deepEqual(logs, []);
		const stale = instance.get_resolvers();

		// Destroy a subtree whose resolved inner effects are still deferred to its outer boundary.
		reset.click();
		await tick();
		expect_logs('outer pending', 'outer pending');

		// A stale completion must not mount or clean up any of the destroyed deferred effects.
		stale.outer('outer');
		await tick();
		assert.deepEqual(logs, []);
		assert.htmlEqual(
			target.innerHTML,
			'<button>inner</button><button>outer</button><button>reset</button><div>outer pending</div>'
		);

		outer.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>inner</button><button>outer</button><button>reset</button><div>inner pending</div><p>outer</p>'
		);
		expect_logs('inner pending', 'outer pending');
		inner.click();
		await tick();
		expect_logs('inner', 'inner pending');
	}
});
