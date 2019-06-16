import * as assert from 'assert';
import deindent from './deindent';
import CodeBuilder from './CodeBuilder';
import get_name_from_filename from './get_name_from_filename';

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

	it('removes newlines before an empty expression', () => {
		const deindented = deindent`
			{
				some text

				${null}
			}`;

		assert.equal(deindented, `{\n\tsome text\n}`);
	});

	it('removes newlines after an empty expression', () => {
		const deindented = deindent`
			{
				${null}

				some text
			}`;

		assert.equal(deindented, `{\n\tsome text\n}`);
	});

	it('removes newlines around empty expressions', () => {
		const deindented = deindent`
			{
				${null}

				some text

				${null}

				some text

				${null}
			}`;

		assert.equal(deindented, `{\n\tsome text\n\n\tsome text\n}`);
	});
});

describe('CodeBuilder', () => {
	it('creates an empty block', () => {
		const builder = new CodeBuilder();
		assert.equal(builder.toString(), '');
	});

	it('creates a block with a line', () => {
		const builder = new CodeBuilder();

		builder.add_line('var answer = 42;');
		assert.equal(builder.toString(), 'var answer = 42;');
	});

	it('creates a block with two lines', () => {
		const builder = new CodeBuilder();

		builder.add_line('var problems = 99;');
		builder.add_line('var answer = 42;');
		assert.equal(builder.toString(), 'var problems = 99;\nvar answer = 42;');
	});

	it('adds newlines around blocks', () => {
		const builder = new CodeBuilder();

		builder.add_line('// line 1');
		builder.add_line('// line 2');
		builder.add_block(deindent`
			if (foo) {
				bar();
			}
		`);
		builder.add_line('// line 3');
		builder.add_line('// line 4');

		assert.equal(
			builder.toString(),
			deindent`
			// line 1
			// line 2

			if (foo) {
				bar();
			}

			// line 3
			// line 4
		`
		);
	});

	it('nests codebuilders with correct indentation', () => {
		const child = new CodeBuilder();

		child.add_block(deindent`
			var obj = {
				answer: 42
			};
		`);

		const builder = new CodeBuilder();

		builder.add_line('// line 1');
		builder.add_line('// line 2');
		builder.add_block(deindent`
			if (foo) {
				${child}
			}
		`);
		builder.add_line('// line 3');
		builder.add_line('// line 4');

		assert.equal(
			builder.toString(),
			deindent`
			// line 1
			// line 2

			if (foo) {
				var obj = {
					answer: 42
				};
			}

			// line 3
			// line 4
		`
		);
	});
});

describe('get_name_from_filename', () => {
	it('uses the basename', () => {
		assert.equal(get_name_from_filename('path/to/Widget.svelte'), 'Widget');
	});

	it('uses the directory name, if basename is index', () => {
		assert.equal(get_name_from_filename('path/to/Widget/index.svelte'), 'Widget');
	});

	it('handles unusual filenames', () => {
		assert.equal(get_name_from_filename('path/to/[...parts].svelte'), 'Parts');
	});
});
