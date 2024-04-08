import { walk } from 'zimmerframe';
import { warn } from '../../../warnings.js';

/**
 * @param {import('#compiler').Css.StyleSheet} stylesheet
 * @param {import('../../types.js').RawWarning[]} warnings
 */
export function warn_unused(stylesheet, warnings) {
	walk(stylesheet, { warnings, stylesheet }, visitors);
}

/** @type {import('zimmerframe').Visitors<import('#compiler').Css.Node, { warnings: import('../../types.js').RawWarning[], stylesheet: import('#compiler').Css.StyleSheet }>} */
const visitors = {
	ComplexSelector(node, context) {
		if (!node.metadata.used) {
			for (let i = context.path.length - 1; i >= 0; i--) {
				const parent = context.path[i];
				if (parent.type === 'RelativeSelector' && parent.metadata.is_global) {
					return; // no need to recurse; everything below is global, too
				}
			}

			const content = context.state.stylesheet.content;
			const text = content.styles.substring(node.start - content.start, node.end - content.start);
			warn(context.state.warnings, node, context.path, 'css-unused-selector', text);
		}

		context.next();
	}
};
