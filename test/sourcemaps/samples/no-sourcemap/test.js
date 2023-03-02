export function test({ assert, js, css }) {
	assert.equal(js.map, null);
	assert.equal(css.map, null);
}
