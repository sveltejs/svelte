import { snippetCompletion } from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';

/** @typedef {(node: import('@lezer/common').SyntaxNode, context: import('@codemirror/autocomplete').CompletionContext, selected: import('./types').File) => boolean} Test */

/**
 * Returns `true` if `$bindable()` is valid
 * @type {Test}
 */
function is_bindable(node, context) {
	// disallow outside `let { x = $bindable }`
	if (node.parent?.name !== 'PatternProperty') return false;
	if (node.parent.parent?.name !== 'ObjectPattern') return false;
	if (node.parent.parent.parent?.name !== 'VariableDeclaration') return false;

	let last = node.parent.parent.parent.lastChild;
	if (!last) return true;

	// if the declaration is incomplete, assume the best
	if (last.name === 'ObjectPattern' || last.name === 'Equals' || last.name === '⚠') {
		return true;
	}

	if (last.name === ';') {
		last = last.prevSibling;
		if (!last || last.name === '⚠') return true;
	}

	// if the declaration is complete, only return true if it is a `$props()` declaration
	return (
		last.name === 'CallExpression' &&
		last.firstChild?.name === 'VariableName' &&
		context.state.sliceDoc(last.firstChild.from, last.firstChild.to) === '$props'
	);
}

/**
 * Returns `true` if `$props()` is valid
 * TODO only allow in `.svelte` files, and only at the top level
 * @type {Test}
 */
function is_props(node, _, selected) {
	if (selected.type !== 'svelte') return false;

	return (
		node.name === 'VariableName' &&
		node.parent?.name === 'VariableDeclaration' &&
		node.parent.parent?.name === 'Script'
	);
}

/**
 * Returns `true` is this is a valid place to declare state
 * @type {Test}
 */
function is_state(node) {
	let parent = node.parent;

	if (node.name === '.' || node.name === 'PropertyName') {
		if (parent?.name !== 'MemberExpression') return false;
		parent = parent.parent;
	}

	if (!parent) return false;

	return parent.name === 'VariableDeclaration' || parent.name === 'PropertyDeclaration';
}

/**
 * Returns `true` if we're already in a valid call expression, e.g.
 * changing an existing `$state()` to `$state.raw()`
 * @type {Test}
 */
function is_state_call(node) {
	let parent = node.parent;

	if (node.name === '.' || node.name === 'PropertyName') {
		if (parent?.name !== 'MemberExpression') return false;
		parent = parent.parent;
	}

	if (parent?.name !== 'CallExpression') {
		return false;
	}

	parent = parent.parent;
	if (!parent) return false;

	return parent.name === 'VariableDeclaration' || parent.name === 'PropertyDeclaration';
}

/** @type {Test} */
function is_statement(node) {
	if (node.name === 'VariableName') {
		return node.parent?.name === 'ExpressionStatement';
	}

	if (node.name === '.' || node.name === 'PropertyName') {
		return node.parent?.parent?.name === 'ExpressionStatement';
	}

	return false;
}

/** @type {Array<{ snippet: string, test?: Test }>} */
const runes = [
	{ snippet: '$state(${})', test: is_state },
	{ snippet: '$state', test: is_state_call },
	{ snippet: '$props()', test: is_props },
	{ snippet: '$derived(${});', test: is_state },
	{ snippet: '$derived', test: is_state_call },
	{ snippet: '$derived.by(() => {\n\t${}\n});', test: is_state },
	{ snippet: '$derived.by', test: is_state_call },
	{ snippet: '$effect(() => {\n\t${}\n});', test: is_statement },
	{ snippet: '$effect.pre(() => {\n\t${}\n});', test: is_statement },
	{ snippet: '$state.raw(${});', test: is_state },
	{ snippet: '$state.raw', test: is_state_call },
	{ snippet: '$bindable()', test: is_bindable },
	{ snippet: '$effect.root(() => {\n\t${}\n})' },
	{ snippet: '$state.snapshot(${})' },
	{ snippet: '$state.is(${})' },
	{ snippet: '$effect.tracking()' },
	{ snippet: '$inspect(${});', test: is_statement }
];

const options = runes.map(({ snippet, test }, i) => ({
	option: snippetCompletion(snippet, {
		type: 'keyword',
		boost: runes.length - i,
		label: snippet.includes('(') ? snippet.slice(0, snippet.indexOf('(')) : snippet
	}),
	test
}));

/**
 * @param {import('@codemirror/autocomplete').CompletionContext} context
 * @param {import('./types.js').File} selected
 * @param {import('./types.js').File[]} files
 */
export function autocomplete(context, selected, files) {
	let node = syntaxTree(context.state).resolveInner(context.pos, -1);

	if (node.name === 'String' && node.parent?.name === 'ImportDeclaration') {
		const modules = [
			'svelte',
			'svelte/animate',
			'svelte/easing',
			'svelte/events',
			'svelte/legacy',
			'svelte/motion',
			'svelte/reactivity',
			'svelte/store',
			'svelte/transition'
		];

		for (const file of files) {
			if (file === selected) continue;
			modules.push(`./${file.name}.${file.type}`);
		}

		return {
			from: node.from + 1,
			options: modules.map((label) => ({
				label,
				type: 'string'
			}))
		};
	}

	if (
		selected.type !== 'svelte' &&
		(selected.type !== 'js' || !selected.name.endsWith('.svelte'))
	) {
		return false;
	}

	if (node.name === 'VariableName' || node.name === 'PropertyName' || node.name === '.') {
		// special case — `$inspect(...).with(...)` is the only rune that 'returns'
		// an 'object' with a 'method'
		if (node.name === 'PropertyName' || node.name === '.') {
			if (
				node.parent?.name === 'MemberExpression' &&
				node.parent.firstChild?.name === 'CallExpression' &&
				node.parent.firstChild.firstChild?.name === 'VariableName' &&
				context.state.sliceDoc(
					node.parent.firstChild.firstChild.from,
					node.parent.firstChild.firstChild.to
				) === '$inspect'
			) {
				const open = context.matchBefore(/\.\w*/);
				if (!open) return null;

				return {
					from: open.from,
					options: [snippetCompletion('.with(${})', { type: 'keyword', label: '.with' })]
				};
			}
		}

		const open = context.matchBefore(/\$[\w\.]*/);
		if (!open) return null;

		return {
			from: open.from,
			options: options
				.filter((option) => (option.test ? option.test(node, context, selected) : true))
				.map((option) => option.option)
		};
	}
}
