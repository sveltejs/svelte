import { walk } from 'zimmerframe';
import { warn } from '../../../warnings.js';
import { is_keyframes_node } from '../../css.js';

/**
 * @param {import('#compiler').Css.StyleSheet} stylesheet
 * @param {import('../../types.js').RawWarning[]} warnings
 */
export function warn_unused(stylesheet, warnings) {
	walk(stylesheet, { warnings, stylesheet }, visitors);
}

/** @type {import('zimmerframe').Visitors<import('#compiler').Css.Node, { warnings: import('../../types.js').RawWarning[], stylesheet: import('#compiler').Css.StyleSheet }>} */
const visitors = {
	Atrule(node, context) {
		if (!is_keyframes_node(node)) {
			context.next();
		}
	},
	PseudoClassSelector(node, context) {
		if (node.name === 'is' || node.name === 'where') {
			context.next();
		}
	},
	ComplexSelector(node, context) {
		if (!node.metadata.used) {
			const content = context.state.stylesheet.content;
			const text = content.styles.substring(node.start - content.start, node.end - content.start);
			warn(context.state.warnings, node, 'css-unused-selector', text);
		}

		context.next();
	},
	Rule(node, context) {
		if (node.metadata.is_global_block) {
			context.visit(node.prelude);
		} else {
			context.next();
		}
	}
};
