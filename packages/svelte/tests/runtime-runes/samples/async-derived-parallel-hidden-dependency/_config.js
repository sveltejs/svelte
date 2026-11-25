import { tick } from 'svelte';
import { test } from '../../test';

const expected_cases = [
	['store', '<p>42</p>'],
	['member', '<p>42/42</p>'],
	['default', '<p>42/42</p>'],
	['array-default', '<p>42/42</p>'],
	['class', '<p>42/42</p>'],
	['shadowed-effect', '<p>42/42</p>'],
	['function-derived', '<p>42/42</p>'],
	['named-function', '<p>42/42</p>'],
	['coercion', '<output>42</output>'],
	['default-parameter-alias', '<output>42</output>'],
	['external-alias', '<output>42</output>'],
	['escaped-primitive', '<output>42</output>'],
	['escaped-store', '<output>42</output>'],
	['escaped-named-function', '<output>42</output>'],
	['escaped-constructor', '<output>42</output>'],
	['escaped-tagged-template', '<output>42</output>'],
	['for-in', '<output>answer</output>'],
	['for-of', '<output>42</output>'],
	['function-alias', '<output>42</output>'],
	['getter-read', '<output>42</output>'],
	['getter-write', '<output>42</output>'],
	['module-reassignment', '<output>42</output>'],
	['opaque-arguments', '<output>42</output>'],
	['opaque', '<output>module import ready returned</output>'],
	['property-alias', '<output>42</output>'],
	['pure-gaps', '<output>4 label 3 4</output>'],
	['tagged-template', '<output>42</output>'],
	['property-read', '<output>1/42</output>'],
	['string-method', '<output>1/HELLO</output>'],
	['nested-alias', '<output>1/42</output>'],
	['default-helper', '<output>1/42</output>'],
	['dependent-getter', '<output>42/42</output>'],
	['dependent-options', '<output>42/42</output>'],
	['property-write', '<output>1/42</output>'],
	['default-function-alias', '<output>42/42</output>'],
	['loop-function-alias', '<output>42/42</output>'],
	['thrown-function-alias', '<output>42/42</output>'],
	['var-function-alias', '<output>42/42</output>'],
	['plain-property-gap', '<output>1/42/2</output>'],
	['primitive-parameter-gap', '<output>1/42/2</output>'],
	['unused-callback-gap', '<output>1/42/42</output>'],
	['string-method-gap', '<output>1/HELLO/2</output>'],
	['local-accessor-gap', '<output>1/21/21/21</output>'],
	['object-return-gap', '<output>1/42/2</output>'],
	['callback-write-gap', '<output>42</output>'],
	['receiver-mutation-gap', '<output>42</output>'],
	['mixed-coercion-calls', '<output>42/42/42</output>'],
	['thenable-gap', '<output>42</output>'],
	['async-thenable-gap', '<output>42</output>'],
	['external-getter-gap', '<output>42</output>'],
	['opaque-argument-barrier', '<output>42/42</output>'],
	['loop-gap', '<output>1/6/2</output>'],
	['object-assign', '<output>42</output>'],
	['imported-method-barrier', '<output>1/2/3/4</output>'],
	['destructured-getter', '<output>42/42</output>'],
	['stored-callback', '<output>42</output>'],
	['imported-registry', '<output>42</output>']
];

const expected_logs = {
	opaque: [
		'module independent',
		'import independent',
		'import gate',
		'import argument',
		'module checkpoint',
		'import checkpoint',
		'import return',
		'module dependent'
	],
	'pure-gaps': ['load first', 'load second', 'checkpoint', 'load label'],
	'property-read': ['load a', 'load b', 'checkpoint'],
	'string-method': ['load a', 'load b', 'checkpoint'],
	'nested-alias': ['load a', 'load b', 'checkpoint'],
	'default-helper': ['load a', 'load b', 'checkpoint'],
	'dependent-getter': ['load a', 'resolve a', 'load b', 'checkpoint'],
	'dependent-options': ['load a', 'resolve a', 'checkpoint', 'load b'],
	'property-write': ['load a', 'resolve a', 'checkpoint', 'load b'],
	'default-function-alias': ['load a', 'resolve a', 'read b', 'checkpoint'],
	'plain-property-gap': ['load a', 'load b', 'checkpoint'],
	'primitive-parameter-gap': ['load a', 'load b', 'checkpoint'],
	'unused-callback-gap': ['load a', 'load b', 'checkpoint'],
	'string-method-gap': ['load a', 'load b', 'checkpoint'],
	'local-accessor-gap': ['load a', 'load b', 'checkpoint'],
	'object-return-gap': ['load a', 'load b', 'checkpoint'],
	'opaque-argument-barrier': ['load a', 'load b', 'checkpoint'],
	'loop-gap': ['load a', 'load b', 'checkpoint'],
	'imported-method-barrier': ['load a', 'load b', 'load c', 'load d', 'checkpoint']
};

/** @param {Array<[string, string]>} logs */
function group_logs(logs) {
	/** @type {Record<string, string[]>} */
	const groups = {};

	for (const [name, event] of logs) {
		(groups[name] ??= []).push(event);
	}

	return groups;
}

export default test({
	mode: ['client', 'hydrate', 'async-server'],
	ssrHtml: expected_cases
		.map(([name, html]) => `<section data-case="${name}">${html}</section>`)
		.join(''),
	async test({ assert, target, logs }) {
		await tick();
		const sections = target.querySelectorAll('section[data-case]');
		assert.equal(sections.length, expected_cases.length);

		for (const [index, [name, html]] of expected_cases.entries()) {
			assert.equal(sections[index].getAttribute('data-case'), name);
			assert.htmlEqual(sections[index].innerHTML, html);
		}

		assert.deepEqual(group_logs(logs), expected_logs);
	},
	test_ssr({ assert, logs }) {
		assert.deepEqual(group_logs(logs), expected_logs);
	}
});
