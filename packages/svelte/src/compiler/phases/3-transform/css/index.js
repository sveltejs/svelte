import MagicString from 'magic-string';
import { walk } from 'zimmerframe';

/** @typedef {{ code: MagicString, dev: boolean }} State */

/**
 *
 * @param {string} source
 * @param {import('#compiler').Css.StyleSheet} stylesheet
 * @param {string} file
 * @param {boolean} dev
 */
export function render_stylesheet(source, stylesheet, file, dev) {
	const code = new MagicString(source);

	/** @type {State} */
	const state = {
		code,
		dev
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
	Rule(node, { state, next }) {
		// keep empty rules in dev, because it's convenient to
		// see them in devtools
		// if (!state.dev && this.is_empty()) {
		// 	state.code.prependRight(node.start, '/* (empty) ');
		// 	state.code.appendLeft(node.end, '*/');
		// 	escape_comment_close(node, state.code);
		// 	return;
		// }

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
	}
};

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
