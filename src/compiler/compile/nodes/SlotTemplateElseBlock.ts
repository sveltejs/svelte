import Component from '../Component';
import Expression from './shared/Expression';
import TemplateScope from './shared/TemplateScope';
import { INode } from './interfaces';
import compiler_errors from '../compiler_errors';
import get_const_tags from './shared/get_const_tags';
import ConstTag from './ConstTag';
import AbstractBlock from './shared/AbstractBlock';
import { regex_only_whitespaces } from '../../utils/patterns';


export default class SlotTemplateElseBlock extends AbstractBlock {
	type: 'SlotTemplateElseBlock';
	expression: Expression;
	scope: TemplateScope;
	const_tags: ConstTag[];

	constructor(
		component: Component,
		parent: INode,
		scope: TemplateScope,
		info: any
	) {
		super(component, parent, scope, info);
		this.scope = scope.child();

		const children = [];
		for (const child of info.children) {
			if (child.type === 'SlotTemplate' || child.type === 'ConstTag') {
				children.push(child);
			} else if (child.type === 'Comment') {
				// ignore
			} else if (child.type === 'Text' && regex_only_whitespaces.test(child.data)) {
				// ignore
			} else if (child.type === 'IfBlock') {
				children.push({
					...child,
					type: 'SlotTemplateIfBlock'
				});
			} else {
				this.component.error(child, compiler_errors.invalid_mix_element_and_conditional_slot);
			}
		}

		([this.const_tags, this.children] = get_const_tags(children, component, this, this));
	}
}
