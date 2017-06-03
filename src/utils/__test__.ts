import * as assert from 'assert';
import deindent from './deindent';
import CodeBuilder from './CodeBuilder';

describe('deindent', () => {
	it('deindents a simple string', () => {
		const deindented = deindent`
			deindent me please
		`;

		assert.equal(deindented, `deindent me please`);
	});

	it('deindents a multiline string', () => {
		const deindented = deindent`
			deindent me please
			and me as well
		`;

		assert.equal(deindented, `deindent me please\nand me as well`);
	});

	it('preserves indentation of inserted values', () => {
		const insert = deindent`
			line one
			line two
		`;

		const deindented = deindent`
			before
				${insert}
			after
		`;

		assert.equal(deindented, `before\n\tline one\n\tline two\nafter`);
	});
});

describe('CodeBuilder', () => {
	it('creates an empty block', () => {
		const builder = new CodeBuilder();
		assert.equal(builder.toString(), '');
	});

	it('creates a block with a line', () => {
		const builder = new CodeBuilder();

		builder.addLine('var answer = 42;');
		assert.equal(builder.toString(), 'var answer = 42;');
	});

	it('creates a block with two lines', () => {
		const builder = new CodeBuilder();

		builder.addLine('var problems = 99;');
		builder.addLine('var answer = 42;');
		assert.equal(builder.toString(), 'var problems = 99;\nvar answer = 42;');
	});

	it('adds newlines around blocks', () => {
		const builder = new CodeBuilder();

		builder.addLine('// line 1');
		builder.addLine('// line 2');
		builder.addBlock(deindent`
			if ( foo ) {
				bar();
			}
		`);
		builder.addLine('// line 3');
		builder.addLine('// line 4');

		assert.equal(
			builder.toString(),
			deindent`
			// line 1
			// line 2

			if ( foo ) {
				bar();
			}

			// line 3
			// line 4
		`
		);
	});

	it('nests codebuilders with correct indentation', () => {
		const child = new CodeBuilder();

		child.addBlock(deindent`
			var obj = {
				answer: 42
			};
		`);

		const builder = new CodeBuilder();

		builder.addLine('// line 1');
		builder.addLine('// line 2');
		builder.addBlock(deindent`
			if ( foo ) {
				${child}
			}
		`);
		builder.addLine('// line 3');
		builder.addLine('// line 4');

		assert.equal(
			builder.toString(),
			deindent`
			// line 1
			// line 2

			if ( foo ) {
				var obj = {
					answer: 42
				};
			}

			// line 3
			// line 4
		`
		);
	});

	it('adds a line at start', () => {
		const builder = new CodeBuilder();

		builder.addLine('// second');
		builder.addLineAtStart('// first');

		assert.equal(
			builder.toString(),
			deindent`
			// first
			// second
		`
		);
	});

	it('adds a line at start before a block', () => {
		const builder = new CodeBuilder();

		builder.addBlock('// second');
		builder.addLineAtStart('// first');

		assert.equal(
			builder.toString(),
			deindent`
			// first

			// second
		`
		);
	});

	it('adds a block at start', () => {
		const builder = new CodeBuilder();

		builder.addLine('// second');
		builder.addBlockAtStart('// first');

		assert.equal(
			builder.toString(),
			deindent`
			// first

			// second
		`
		);
	});

	it('adds a block at start before a block', () => {
		const builder = new CodeBuilder();

		builder.addBlock('// second');
		builder.addBlockAtStart('// first');

		assert.equal(
			builder.toString(),
			deindent`
			// first

			// second
		`
		);
	});
});
