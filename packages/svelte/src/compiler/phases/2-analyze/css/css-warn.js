import { walk } from 'zimmerframe';
import * as w from '../../../warnings.js';
import { is_keyframes_node } from '../../css.js';

/**
 * @param {import('#compiler').Css.StyleSheet} stylesheet
 */
export function warn_unused(stylesheet) {
	walk(stylesheet, { stylesheet }, visitors);
}

/** @type {import('zimmerframe').Visitors<import('#compiler').Css.Node, { stylesheet: import('#compiler').Css.StyleSheet }>} */
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
			w.css_unused_selector(node, text);
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
