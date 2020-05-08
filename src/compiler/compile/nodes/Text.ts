import Node from './shared/Node';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { INode } from './interfaces';

// Whitespace inside one of these elements will not result in
// a whitespace node being created in any circumstances. (This
// list is almost certainly very incomplete)
const elements_without_text = new Set([
	'audio',
	'datalist',
	'dl',
	'optgroup',
	'select',
	'video',
]);

export default class Text extends Node {
	type: 'Text';
	data: string;
	synthetic: boolean;

	constructor(component: Component, parent: INode, scope: TemplateScope, info: any) {
		super(component, parent, scope, info);
		this.data = info.data;
		this.synthetic = info.synthetic || false;
		this.validate();
	}

	should_skip() {
		if (/\S/.test(this.data)) return false;

		const parent_element = this.find_nearest(/(?:Element|InlineComponent|Head)/);
		if (!parent_element) return false;

		if (parent_element.type === 'Head') return true;
		if (parent_element.type === 'InlineComponent') return parent_element.children.length === 1 && this === parent_element.children[0];

		// svg namespace exclusions
		if (/svg$/.test(parent_element.namespace)) {
			if (this.prev && this.prev.type === "Element" && this.prev.name === "tspan") return false;
		}

		return parent_element.namespace || elements_without_text.has(parent_element.name);
	}

	validate() {
		const { data, component, parent } = this;

		// https://github.com/mathiasbynens/emoji-regex/blob/master/src/index.js
		const emoji_regex =/<% emojiSequence %>|\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}/gu;

		if (!emoji_regex.test(data)) return;

		let is_accessible = false;

		if (parent.type === 'Element' && parent.name === 'span') {
			const { attributes } = parent;
			const role = parent.get_static_attribute_value('role');
			const aria_label_index = attributes.findIndex(attr => 
				attr.type === 'Attribute' &&
				(attr.name === 'aria-label' || attr.name === 'aria-labelledby') 
			);

			if (role === 'img' && aria_label_index > -1) {
				is_accessible = true;
			}
		}

		if (!is_accessible) {
			component.warn(this, {
				code: 'a11y-accessible-emoji',
				message: 'A11y: emojis should be wrapped in a <span>, with role="img", and have a description using aria-label or aria-labelledby'
			});
		}
	}
}
