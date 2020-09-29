export function test({ assert, preprocessed, js }) {

	assert.equal(preprocessed.error, undefined);

	// sourcemap stores location only for 'answer = 42;'
	// not for 'var answer = 42;'
	[
		[js, 'foo.js', 'answer = 42;'],
		[js, 'bar.js', 'console.log(answer);'],
		[js, 'foo2.js', 'answer2 = 84;'],
		[js, 'bar2.js', 'console.log(answer2);'],
	]
	.forEach(([where, sourcefile, content]) => {

		assert.deepEqual(
			where.mapConsumer.originalPositionFor(
				where.locate_1(content)
			),
			{
				source: sourcefile,
				name: null,
				line: 1,
				column: 0
			},
			`failed to locate "${content}" from "${sourcefile}"`
		);

	});
}
