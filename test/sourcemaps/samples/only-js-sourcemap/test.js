export function test({ assert, js, css }) {
	assert.notEqual(js.map, null);
	assert.equal(css.map, null);
}
