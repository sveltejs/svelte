const regex_css_browser_prefix = /^-((webkit)|(moz)|(o)|(ms))-/;
export const regex_css_name_boundary = /^[\s,;}]$/;

/**
 * @param {string} name
 * @returns {string}
 */
export function remove_css_prefix(name) {
	return name.replace(regex_css_browser_prefix, '');
}

/** @param {import('#compiler').Css.Atrule} node */
export const is_keyframes_node = (node) => remove_css_prefix(node.name) === 'keyframes';
