import { test } from '../../test';

export default test({
	get props() {
		return {
			configs: [
				{ testcase: 'parent_override_child_default', value: { foo: 'mon' } },
				{ testcase: 'child_default_populate_parent', value: undefined },
				{ testcase: 'reactive_update', value: { foo: 'mon' } },
				{ testcase: 'reactive_mutate', value: { foo: 'mon' } },
				{ testcase: 'init_update', value: { foo: 'mon' } },
				{ testcase: 'init_mutate', value: { foo: 'mon' } }
			]
		};
	},

	async test({ assert, component }) {
		const parents = component.parents;

		// first testcase should update once
		// the rest should update twice
		let p;
		p = parents['parent_override_child_default'];
		assert.deepEqual(p.value, { foo: 'mon' });
		assert.equal(p.updates.length, 1);

		p = parents['child_default_populate_parent'];
		assert.deepEqual(p.value, { foo: 'kid' });
		assert.equal(p.updates.length, 2);

		p = parents['reactive_update'];
		assert.deepEqual(p.value, { foo: 'kid' });
		assert.equal(p.updates.length, 2);

		p = parents['reactive_mutate'];
		assert.deepEqual(p.value, { foo: 'kid' });
		assert.equal(p.updates.length, 1);

		p = parents['init_update'];
		assert.deepEqual(p.value, { foo: 'kid' });
		assert.equal(p.updates.length, 2);

		p = parents['init_mutate'];
		assert.deepEqual(p.value, { foo: 'kid' });
		assert.equal(p.updates.length, 1);
	}
});
