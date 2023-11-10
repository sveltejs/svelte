import { ok, test } from '../../test';

export default test({
	async test({ assert, component, target, raf }) {
		const a = target.querySelector('button.a');
		const b = target.querySelector('button.b');
		ok(a);
		ok(b);
		// jsdom doesn't set the inert attribute, and the transition checks if it exists, so set it manually to trigger the inert logic
		a.inert = false;
		b.inert = false;

		// check and abort halfway through the outro transition
		component.visible = false;
		raf.tick(50);
		assert.strictEqual(target.querySelector('button.a')?.inert, true);
		assert.strictEqual(target.querySelector('button.b')?.inert, true);

		component.visible = true;
		assert.strictEqual(target.querySelector('button.a')?.inert, false);
		assert.strictEqual(target.querySelector('button.b')?.inert, false);

		// let it transition out completely and then back in
		component.visible = false;
		raf.tick(101);
		component.visible = true;
		raf.tick(150);
		assert.strictEqual(target.querySelector('button.a')?.inert, false);
		assert.strictEqual(target.querySelector('button.b')?.inert, false);
		raf.tick(151);
		assert.strictEqual(target.querySelector('button.a')?.inert, false);
		assert.strictEqual(target.querySelector('button.b')?.inert, false);
	}
});
