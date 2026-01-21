import { assert, describe, it } from 'vitest';
import { parseCss } from 'svelte/compiler';

describe('parseCss', () => {
	it('parses a simple rule', () => {
		const ast = parseCss('div { color: red; }');
		assert.equal(ast.type, 'StyleSheet');
		assert.equal(ast.children.length, 1);
		assert.equal(ast.children[0].type, 'Rule');
	});

	it('parses at-rules', () => {
		const ast = parseCss('@media (min-width: 800px) { div { color: red; } }');
		assert.equal(ast.children.length, 1);
		assert.equal(ast.children[0].type, 'Atrule');
		if (ast.children[0].type === 'Atrule') {
			assert.equal(ast.children[0].name, 'media');
		}
	});

	it('parses @import', () => {
		const ast = parseCss("@import 'foo.css';");
		assert.equal(ast.children.length, 1);
		assert.equal(ast.children[0].type, 'Atrule');
		if (ast.children[0].type === 'Atrule') {
			assert.equal(ast.children[0].name, 'import');
			assert.equal(ast.children[0].block, null);
		}
	});

	it('parses multiple rules', () => {
		const ast = parseCss('div { color: red; } span { color: blue; }');
		assert.equal(ast.children.length, 2);
	});

	it('has correct start/end positions', () => {
		const ast = parseCss('div { color: red; }');
		assert.equal(ast.start, 0);
		assert.equal(ast.end, 19);
	});

	it('strips BOM', () => {
		const ast = parseCss('\uFEFFdiv { color: red; }');
		assert.equal(ast.start, 0);
		assert.equal(ast.end, 19);
	});

	it('parses nested rules', () => {
		const ast = parseCss('div { color: red; span { color: blue; } }');
		assert.equal(ast.children.length, 1);
		const rule = ast.children[0];
		assert.equal(rule.type, 'Rule');
		if (rule.type === 'Rule') {
			assert.equal(rule.block.children.length, 2); // declaration + nested rule
		}
	});

	it('parses empty stylesheet', () => {
		const ast = parseCss('');
		assert.equal(ast.type, 'StyleSheet');
		assert.equal(ast.children.length, 0);
		assert.equal(ast.start, 0);
		assert.equal(ast.end, 0);
	});

	it('parses whitespace-only stylesheet', () => {
		const ast = parseCss('   \n\t  ');
		assert.equal(ast.children.length, 0);
	});

	it('parses comments', () => {
		const ast = parseCss('/* comment */ div { color: red; }');
		assert.equal(ast.children.length, 1);
		assert.equal(ast.children[0].type, 'Rule');
	});

	it('parses complex selectors', () => {
		const ast = parseCss('div > span + p ~ a { color: red; }');
		assert.equal(ast.children.length, 1);
		const rule = ast.children[0];
		if (rule.type === 'Rule') {
			assert.equal(rule.prelude.type, 'SelectorList');
			assert.equal(rule.prelude.children.length, 1);
			// div > span + p ~ a has 4 relative selectors
			assert.equal(rule.prelude.children[0].children.length, 4);
		}
	});

	it('parses pseudo-classes and pseudo-elements', () => {
		const ast = parseCss('div:hover::before { color: red; }');
		assert.equal(ast.children.length, 1);
		const rule = ast.children[0];
		if (rule.type === 'Rule') {
			const selectors = rule.prelude.children[0].children[0].selectors;
			assert.equal(selectors.length, 3); // div, :hover, ::before
			assert.equal(selectors[0].type, 'TypeSelector');
			assert.equal(selectors[1].type, 'PseudoClassSelector');
			assert.equal(selectors[2].type, 'PseudoElementSelector');
		}
	});

	it('parses @keyframes', () => {
		const ast = parseCss('@keyframes fade { from { opacity: 0; } to { opacity: 1; } }');
		assert.equal(ast.children.length, 1);
		assert.equal(ast.children[0].type, 'Atrule');
		if (ast.children[0].type === 'Atrule') {
			assert.equal(ast.children[0].name, 'keyframes');
			assert.notEqual(ast.children[0].block, null);
		}
	});

	it('parses class and id selectors', () => {
		const ast = parseCss('.foo#bar { color: red; }');
		assert.equal(ast.children.length, 1);
		const rule = ast.children[0];
		if (rule.type === 'Rule') {
			const selectors = rule.prelude.children[0].children[0].selectors;
			assert.equal(selectors.length, 2);
			assert.equal(selectors[0].type, 'ClassSelector');
			assert.equal(selectors[1].type, 'IdSelector');
		}
	});

	it('parses attribute selectors', () => {
		const ast = parseCss('[data-foo="bar"] { color: red; }');
		assert.equal(ast.children.length, 1);
		const rule = ast.children[0];
		if (rule.type === 'Rule') {
			const selectors = rule.prelude.children[0].children[0].selectors;
			assert.equal(selectors.length, 1);
			assert.equal(selectors[0].type, 'AttributeSelector');
			if (selectors[0].type === 'AttributeSelector') {
				assert.equal(selectors[0].name, 'data-foo');
				assert.equal(selectors[0].value, 'bar');
			}
		}
	});
});
