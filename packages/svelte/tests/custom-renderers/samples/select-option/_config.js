import { test } from '../../test';

export default test({
	html: '<select value="b"><option value="a">A</option><option value="b">B</option><option value="c">C</option></select> <p>b</p>',
	test({ assert, target, serialize }) {
		const select = target.children.find(
			(/** @type {any} */ n) => n.type === 'element' && n.name === 'select'
		);
		assert.ok(select);

		// The select element should have a value attribute set via the normal attribute path
		assert.equal(select.attributes['value'], 'b');

		// Each option should have its value as a regular attribute
		const options = select.children.filter(
			(/** @type {any} */ n) => n.type === 'element' && n.name === 'option'
		);
		assert.equal(options.length, 3);
		assert.equal(options[0].attributes['value'], 'a');
		assert.equal(options[1].attributes['value'], 'b');
		assert.equal(options[2].attributes['value'], 'c');

		const html = serialize(target);
		assert.equal(
			html,
			'<select value="b"><option value="a">A</option><option value="b">B</option><option value="c">C</option></select> <p>b</p>'
		);
	}
});
