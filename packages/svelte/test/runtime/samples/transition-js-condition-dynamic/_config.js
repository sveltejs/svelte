export default {
	test({ assert, component, target, raf }) {
		// Undefined -> true
		component.visible = true;
		let div = target.querySelector('div');

		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 0);

		raf.tick(100);
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 1);

		component.visible = false;
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 1);

		raf.tick(200);
		assert.htmlEqual(target.innerHTML, '');
		assert.equal(div.foo, 0);

		component.visible = true;
		div = target.querySelector('div');
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 0);

		raf.tick(300);
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 1);

		// Create a condition object that can be toggled
		let shouldRun = true;
		let conditionObject = {
			get condition() {
				return shouldRun;
			}
		};
		component.condition = () => conditionObject.condition;

		component.visible = false;
		raf.tick(400);
		assert.htmlEqual(target.innerHTML, '');
		
		// in: true, out: false
		shouldRun = true;
		component.visible = true;
		div = target.querySelector('div');

		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 0);

		raf.tick(500);
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 1);

		shouldRun = false;
		component.visible = false;
		assert.htmlEqual(target.innerHTML, '');
		assert.equal(div.foo, 1);

		raf.tick(600);
		assert.htmlEqual(target.innerHTML, '');
		assert.equal(div.foo, 1);

		// in: false, out: true
		shouldRun = false;
		component.visible = true;
		div = target.querySelector('div');

		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.isUndefined(div.foo);

		raf.tick(700);
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.isUndefined(div.foo);

		shouldRun = true;
		component.visible = false;
		assert.htmlEqual(target.innerHTML, '<div></div>');

		raf.tick(800);
		assert.htmlEqual(target.innerHTML, '');
		assert.equal(div.foo, 0);
	}
};
