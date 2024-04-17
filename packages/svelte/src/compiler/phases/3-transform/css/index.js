import MagicString from 'magic-string';
import { walk } from 'zimmerframe';
import { is_keyframes_node, regex_css_name_boundary, remove_css_prefix } from '../../css.js';
import { merge_with_preprocessor_map } from '../../../utils/mapped_code.js';

/**
 * @typedef {{
 *   code: MagicString;
 *   dev: boolean;
 *   hash: string;
 *   selector: string;
 *   keyframes: string[];
 *   specificity: {
 *     bumped: boolean
 *   }
 * }} State
 */

/**
 *
 * @param {string} source
 * @param {import('../../types.js').ComponentAnalysis} analysis
 * @param {import('#compiler').ValidatedCompileOptions} options
 */
export function render_stylesheet(source, analysis, options) {
	const code = new MagicString(source);

	/** @type {State} */
	const state = {
		code,
		dev: options.dev,
		hash: analysis.css.hash,
		selector: `.${analysis.css.hash}`,
		keyframes: analysis.css.keyframes,
		specificity: {
			bumped: false
		}
	};

	const ast = /** @type {import('#compiler').Css.StyleSheet} */ (analysis.css.ast);

	walk(/** @type {import('#compiler').Css.Node} */ (ast), state, visitors);

	code.remove(0, ast.content.start);
	code.remove(/** @type {number} */ (ast.content.end), source.length);

	const css = {
		code: code.toString(),
		map: code.generateMap({
			// include source content; makes it easier/more robust looking up the source map code
			includeContent: true,
			// generateMap takes care of calculating source relative to file
			source: options.filename,
			file: options.cssOutputFilename || options.filename
		})
	};

	merge_with_preprocessor_map(css, options, css.map.sources[0]);

	if (options.dev && options.css === 'injected' && css.code) {
		css.code += `\n/*# sourceMappingURL=${css.map.toUrl()} */`;
	}

	return css;
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
				state.code.prependRight(start, `${state.hash}-`);
			}

			return; // don't transform anything within
		}

		next();
	},
	Declaration(node, { state, next }) {
		const property = node.property && remove_css_prefix(node.property.toLowerCase());
		if (property === 'animation' || property === 'animation-name') {
			let index = node.start + node.property.length + 1;
			let name = '';

			while (index < state.code.original.length) {
				const character = state.code.original[index];

				if (regex_css_name_boundary.test(character)) {
					if (state.keyframes.includes(name)) {
						state.code.prependRight(index - name.length, `${state.hash}-`);
					}

					if (character === ';' || character === '}') {
						break;
					}

					name = '';
				} else {
					name += character;
				}

				index++;
			}
		}
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

		if (!is_used(node)) {
			state.code.prependRight(node.start, '/* (unused) ');
			state.code.appendLeft(node.end, '*/');
			escape_comment_close(node, state.code);

			return;
		}

		next();
	},
	SelectorList(node, { state, next, path }) {
		let pruning = false;
		let last = node.children[0].start;

		for (let i = 0; i < node.children.length; i += 1) {
			const selector = node.children[i];

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

		// if we're in a `:is(...)` or whatever, keep existing specificity bump state
		let specificity = state.specificity;

		// if this selector list belongs to a rule, require a specificity bump for the
		// first scoped selector but only if we're at the top level
		let parent = path.at(-1);
		if (parent?.type === 'Rule') {
			specificity = { bumped: false };

			/** @type {import('#compiler').Css.Rule | null} */
			let rule = parent.metadata.parent_rule;

			while (rule) {
				if (rule.metadata.has_local_selectors) {
					specificity = { bumped: true };
					break;
				}
				rule = rule.metadata.parent_rule;
			}
		}

		next({ ...state, specificity });
	},
	ComplexSelector(node, context) {
		const before_bumped = context.state.specificity.bumped;

		/** @param {import('#compiler').Css.SimpleSelector} selector */
		function remove_global_pseudo_class(selector) {
			context.state.code
				.remove(selector.start, selector.start + ':global('.length)
				.remove(selector.end - 1, selector.end);
		}

		for (const relative_selector of node.children) {
			if (relative_selector.metadata.is_global) {
				remove_global_pseudo_class(relative_selector.selectors[0]);
				continue;
			}

			if (relative_selector.metadata.scoped) {
				if (relative_selector.selectors.length === 1) {
					// skip standalone :is/:where/& selectors
					const selector = relative_selector.selectors[0];
					if (
						selector.type === 'PseudoClassSelector' &&
						(selector.name === 'is' || selector.name === 'where')
					) {
						continue;
					}
				}

				if (relative_selector.selectors.every((s) => s.type === 'NestingSelector')) {
					continue;
				}

				// for the first occurrence, we use a classname selector, so that every
				// encapsulated selector gets a +0-1-0 specificity bump. thereafter,
				// we use a `:where` selector, which does not affect specificity
				let modifier = context.state.selector;
				if (context.state.specificity.bumped) modifier = `:where(${modifier})`;

				context.state.specificity.bumped = true;

				// for any :global() at the middle of compound selector
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
			}
		}

		context.next();

		context.state.specificity.bumped = before_bumped;
	},
	PseudoClassSelector(node, context) {
		if (node.name === 'is' || node.name === 'where') {
			context.next();
		}
	}
};

/** @param {import('#compiler').Css.Rule} rule */
function is_empty(rule) {
	for (const child of rule.block.children) {
		if (child.type === 'Declaration') {
			return false;
		}

		if (child.type === 'Rule') {
			if (is_used(child) && !is_empty(child)) return false;
		}

		if (child.type === 'Atrule') {
			return false; // TODO
		}
	}

	return true;
}

/** @param {import('#compiler').Css.Rule} rule */
function is_used(rule) {
	for (const selector of rule.prelude.children) {
		if (selector.metadata.used) return true;
	}

	for (const child of rule.block.children) {
		if (child.type === 'Rule' && is_used(child)) return true;

		if (child.type === 'Atrule') {
			return true; // TODO
		}
	}

	return false;
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
