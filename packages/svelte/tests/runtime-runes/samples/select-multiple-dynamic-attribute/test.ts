export async function test({ assert, target, logs }: { assert: any; target: any; logs: any }) {
	const select = target.querySelector('select');
	const options = target.querySelectorAll('option');
	const [btn] = target.querySelectorAll('button');

	assert.equal(select.multiple, false);
	assert.equal(options[0].selected, false);
	assert.equal(options[1].selected, true);
	assert.equal(options[2].selected, false);

	btn.click();
	await Promise.resolve();

	assert.equal(select.multiple, true);
	assert.equal(options[0].selected, false);
	assert.equal(options[1].selected, true);
	assert.equal(options[2].selected, false);

	btn.click();
	await Promise.resolve();

	assert.equal(select.multiple, false);
	assert.equal(options[0].selected, false);
	assert.equal(options[1].selected, true);
	assert.equal(options[2].selected, false);
}
