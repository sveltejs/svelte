import { ok, test } from '../../test';

export default test({
	async test({ assert, component, target, raf }) {
		const a = target.querySelector('button.a');
		const b = target.querySelector('button.b');
		ok(a);
		ok(b);

		// check and abort halfway through the outro transition
		component.visible = false;
		raf.tick(50);
		assert.ok(target.querySelector('button.a')?.inert);
		assert.ok(target.querySelector('button.b')?.inert);

		component.visible = true;
		assert.ok(!target.querySelector('button.a')?.inert);
		assert.ok(!target.querySelector('button.b')?.inert);

		// let it transition out completely and then back in
		component.visible = false;
		raf.tick(101);
		component.visible = true;
		raf.tick(150);
		assert.ok(!target.querySelector('button.a')?.inert);
		assert.ok(!target.querySelector('button.b')?.inert);
		raf.tick(151);
		assert.ok(!target.querySelector('button.a')?.inert);
		assert.ok(!target.querySelector('button.b')?.inert);
	}
});
