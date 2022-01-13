export function test({ assert, js, css }) {
	assert.equal(js.map, null);
	assert.notEqual(css.map, null);
}
