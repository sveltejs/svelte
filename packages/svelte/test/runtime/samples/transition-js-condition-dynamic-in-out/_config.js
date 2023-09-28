export default {
	test({ assert, component, target, raf }) {
		// Undefined -> true
		component.visible = true;
		let div = target.querySelector('div');

		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 0);
		assert.isUndefined(div.bar);

		raf.tick(100);
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 1);
		assert.isUndefined(div.bar);

		component.visible = false;
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 1);

		raf.tick(200);
		assert.htmlEqual(target.innerHTML, '');
		assert.equal(div.foo, 1);
		assert.equal(div.bar, 0);

		component.visible = true;
		div = target.querySelector('div');
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 0);
		assert.isUndefined(div.bar);

		raf.tick(300);
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 1);
		assert.isUndefined(div.bar);

		// Create a condition objects that can be toggled
		let shouldRunIn = true;
		let shouldRunOut = true;
		const conditionObject = {
			get conditionIn() {
				return shouldRunIn;
			},
			get conditionOut() {
				return shouldRunOut;
			}
		};
		component.conditionIn = () => conditionObject.conditionIn;
		component.conditionOut = () => conditionObject.conditionOut;

		component.visible = false;
		raf.tick(400);
		assert.htmlEqual(target.innerHTML, '');

		// in: true, out: false
		shouldRunIn = true;
		shouldRunOut = false;

		component.visible = true;
		div = target.querySelector('div');

		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 0);
		assert.isUndefined(div.bar);

		raf.tick(500);
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 1);
		assert.isUndefined(div.bar);

		component.visible = false;
		assert.htmlEqual(target.innerHTML, '');
		assert.equal(div.foo, 1);
		assert.isUndefined(div.bar);

		raf.tick(600);
		assert.htmlEqual(target.innerHTML, '');
		assert.equal(div.foo, 1);
		assert.isUndefined(div.bar);

		// in: false, out: true
		shouldRunIn = false;
		shouldRunOut = true;

		component.visible = true;
		div = target.querySelector('div');

		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.isUndefined(div.foo);
		assert.isUndefined(div.bar);

		raf.tick(700);
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.isUndefined(div.foo);
		assert.isUndefined(div.bar);

		component.visible = false;
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.isUndefined(div.foo);

		raf.tick(800);
		assert.htmlEqual(target.innerHTML, '');
		assert.isUndefined(div.foo, 1);
		assert.equal(div.bar, 0);
	}
};
