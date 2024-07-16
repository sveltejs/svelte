import { ok, test } from '../../test';

export default test({
	test({ assert, component, target, raf }) {
		component.visible = true;
		const div = target.querySelector('div');
		ok(div);

		assert.equal(div.style.color, 'blue');

		component.visible = false;
		assert.equal(div.style.color, 'yellow');

		// change param
		raf.tick(1);
		component.param = true;
		component.visible = true;

		assert.equal(div.style.color, 'red');

		component.visible = false;
		assert.equal(div.style.color, 'green');
	}
});
