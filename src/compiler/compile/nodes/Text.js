import Node from './shared/Node.js';
import { regex_non_whitespace_character } from '../../utils/patterns.js';

// Whitespace inside one of these elements will not result in
// a whitespace node being created in any circumstances. (This
// list is almost certainly very incomplete)
const elements_without_text = new Set(['audio', 'datalist', 'dl', 'optgroup', 'select', 'video']);
const regex_ends_with_svg = /svg$/;
const regex_non_whitespace_characters = /[\S\u00A0]/;

/** @extends Node<'Text'> */
export default class Text extends Node {
	/** @type {string} */
	data;

	/** @type {boolean} */
	synthetic;

	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('./interfaces.js').INode} parent
	 * @param {import('./shared/TemplateScope.js').default} scope
	 * @param {import('../../interfaces.js').TemplateNode} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.data = info.data;
		this.synthetic = info.synthetic || false;
	}
	should_skip() {
		if (regex_non_whitespace_character.test(this.data)) return false;
		const parent_element = this.find_nearest(/(?:Element|InlineComponent|SlotTemplate|Head)/);
		if (!parent_element) return false;
		if (parent_element.type === 'Head') return true;
		if (parent_element.type === 'InlineComponent')
			return parent_element.children.length === 1 && this === parent_element.children[0];
		// svg namespace exclusions
		if (regex_ends_with_svg.test(parent_element.namespace)) {
			if (this.prev && this.prev.type === 'Element' && this.prev.name === 'tspan') return false;
		}
		return parent_element.namespace || elements_without_text.has(parent_element.name);
	}

	/** @returns {boolean} */
	keep_space() {
		if (this.component.component_options.preserveWhitespace) return true;
		return this.within_pre();
	}

	/** @returns {boolean} */
	within_pre() {
		let node = this.parent;
		while (node) {
			if (node.type === 'Element' && node.name === 'pre') {
				return true;
			}
			node = node.parent;
		}
		return false;
	}

	/** @returns {boolean} */
	use_space() {
		if (this.component.compile_options.preserveWhitespace) return false;
		if (regex_non_whitespace_characters.test(this.data)) return false;
		return !this.within_pre();
	}
}
