import MagicString from 'magic-string';
import { walk } from 'zimmerframe';
import { is_keyframes_node } from '../../css.js';

/** @typedef {{ code: MagicString, dev: boolean, id: string, selector: string }} State */

/**
 *
 * @param {string} source
 * @param {import('#compiler').Css.StyleSheet} stylesheet
 * @param {string} file
 * @param {boolean} dev
 */
export function render_stylesheet(source, stylesheet, file, dev) {
	const code = new MagicString(source);

	const id = 'svelte-xyz'; // TODO

	/** @type {State} */
	const state = {
		code,
		dev,
		id,
		selector: `.${id}`
	};

	walk(/** @type {import('#compiler').Css.Node} */ (stylesheet), state, visitors);

	code.remove(0, stylesheet.content.start);
	code.remove(/** @type {number} */ (stylesheet.content.end), source.length);

	return {
		code: code.toString(),
		map: code.generateMap({
			includeContent: true,
			source: file,
			file
		})
	};
}

/** @type {import('zimmerframe').Visitors<import('#compiler').Css.Node, State>} */
const visitors = {
	_: (node, context) => {
		context.state.code.addSourcemapLocation(node.start);
		context.state.code.addSourcemapLocation(node.end);
		context.next();
	},
	Atrule(node, { state, next }) {
		if (is_keyframes_node(node)) {
			let start = node.start + node.name.length + 1;
			while (state.code.original[start] === ' ') start += 1;
			let end = start;
			while (state.code.original[end] !== '{' && state.code.original[end] !== ' ') end += 1;

			if (node.prelude.startsWith('-global-')) {
				state.code.remove(start, start + 8);
			} else {
				state.code.prependRight(start, `${state.id}-`);
			}

			return; // don't transform anything within
		}

		next();
	},
	Rule(node, { state, next }) {
		// keep empty rules in dev, because it's convenient to
		// see them in devtools
		if (!state.dev && is_empty(node)) {
			state.code.prependRight(node.start, '/* (empty) ');
			state.code.appendLeft(node.end, '*/');
			escape_comment_close(node, state.code);
			return;
		}

		const used = node.prelude.children.filter((s) => s.metadata.used);

		if (used.length === 0) {
			state.code.prependRight(node.start, '/* (unused) ');
			state.code.appendLeft(node.end, '*/');
			escape_comment_close(node, state.code);

			return;
		}

		if (used.length < node.prelude.children.length) {
			let pruning = false;
			let last = node.prelude.children[0].start;

			for (let i = 0; i < node.prelude.children.length; i += 1) {
				const selector = node.prelude.children[i];

				if (selector.metadata.used === pruning) {
					if (pruning) {
						let i = selector.start;
						while (state.code.original[i] !== ',') i--;

						state.code.overwrite(i, i + 1, '*/');
					} else {
						if (i === 0) {
							state.code.prependRight(selector.start, '/* (unused) ');
						} else {
							state.code.overwrite(last, selector.start, ' /* (unused) ');
						}
					}

					pruning = !pruning;
				}

				last = selector.end;
			}

			if (pruning) {
				state.code.appendLeft(last, '*/');
			}
		}

		next();
	},
	ComplexSelector(node, context) {
		/** @param {import('#compiler').Css.SimpleSelector} selector */
		function remove_global_pseudo_class(selector) {
			context.state.code
				.remove(selector.start, selector.start + ':global('.length)
				.remove(selector.end - 1, selector.end);
		}

		let first = true;

		for (const relative_selector of node.children) {
			if (relative_selector.metadata.is_global) {
				remove_global_pseudo_class(relative_selector.selectors[0]);
			}

			if (relative_selector.metadata.should_encapsulate) {
				// for the first occurrence, we use a classname selector, so that every
				// encapsulated selector gets a +0-1-0 specificity bump. thereafter,
				// we use a `:where` selector, which does not affect specificity
				let modifier = context.state.selector;
				if (!first) modifier = `:where(${modifier})`;

				first = false;

				// TODO err... can this happen?
				for (const selector of relative_selector.selectors) {
					if (selector.type === 'PseudoClassSelector' && selector.name === 'global') {
						remove_global_pseudo_class(selector);
					}
				}

				let i = relative_selector.selectors.length;
				while (i--) {
					const selector = relative_selector.selectors[i];

					if (
						selector.type === 'PseudoElementSelector' ||
						selector.type === 'PseudoClassSelector'
					) {
						if (selector.name !== 'root' && selector.name !== 'host') {
							if (i === 0) context.state.code.prependRight(selector.start, modifier);
						}
						continue;
					}

					if (selector.type === 'TypeSelector' && selector.name === '*') {
						context.state.code.update(selector.start, selector.end, modifier);
					} else {
						context.state.code.appendLeft(selector.end, modifier);
					}

					break;
				}
				first = false;
			}
		}

		context.next();
	}
};

/** @param {import('#compiler').Css.Rule} rule */
function is_empty(rule) {
	if (rule.block.children.length > 0) return false;
	return true;
}

/**
 *
 * @param {import('#compiler').Css.Rule} node
 * @param {MagicString} code
 */
function escape_comment_close(node, code) {
	let escaped = false;
	let in_comment = false;

	for (let i = node.start; i < node.end; i++) {
		if (escaped) {
			escaped = false;
		} else {
			const char = code.original[i];
			if (in_comment) {
				if (char === '*' && code.original[i + 1] === '/') {
					code.prependRight(++i, '\\');
					in_comment = false;
				}
			} else if (char === '\\') {
				escaped = true;
			} else if (char === '/' && code.original[++i] === '*') {
				in_comment = true;
			}
		}
	}
}
