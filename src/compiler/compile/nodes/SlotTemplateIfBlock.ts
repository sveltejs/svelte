import SlotTemplateElseBlock from './SlotTemplateElseBlock';
import Component from '../Component';
import AbstractBlock from './shared/AbstractBlock';
import Expression from './shared/Expression';
import TemplateScope from './shared/TemplateScope';
import Node from './shared/Node';
import compiler_errors from '../compiler_errors';
import get_const_tags from './shared/get_const_tags';
import { TemplateNode } from '../../interfaces';
import ConstTag from './ConstTag';
import { regex_only_whitespaces } from '../../utils/patterns';
import SlotTemplate from './SlotTemplate';
import { INode } from './interfaces';


export default class SlotTemplateIfBlock extends AbstractBlock {
	type: 'SlotTemplateIfBlock';
	expression: Expression;
	else: SlotTemplateElseBlock;
	scope: TemplateScope;
	const_tags: ConstTag[];
	slot_names = new Set<string>();

	constructor(
		component: Component,
		parent: Node,
		scope: TemplateScope,
		info: TemplateNode
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

		this.expression = new Expression(component, this, this.scope, info.expression);
		([this.const_tags, this.children] = get_const_tags(children, component, this, this));

		this.else = info.else
			? new SlotTemplateElseBlock(component, this, scope, { ...info.else, type: 'SlotTemplateElseBlock' })
			: null;
	}

	validate_duplicate_slot_name(component_name: string): Map<string, SlotTemplate> {
		const if_slot_names = validate_get_slot_names(this.children, this.component, component_name);
		if (!this.else) {
			return if_slot_names;
		}

		const else_slot_names = validate_get_slot_names(this.else.children, this.component, component_name);
		return new Map([...if_slot_names, ...else_slot_names]);
	}
}

export function validate_get_slot_names(children: Array<INode>, component: Component, component_name: string) {
	const slot_names = new Map<string, SlotTemplate>();
	function add_slot_name(slot_name: string, child: SlotTemplate) {
		if (slot_names.has(slot_name)) {
			component.error(child, compiler_errors.duplicate_slot_name_in_component(slot_name, component_name));
		}
		slot_names.set(slot_name, child);
	}

	for (const child of children) {
		if (child.type === 'SlotTemplateIfBlock') {
			const child_slot_names = child.validate_duplicate_slot_name(component_name);
			for (const [slot_name, child] of child_slot_names) {
				add_slot_name(slot_name, child);
			}
		} else if (child.type === 'SlotTemplate') {
			add_slot_name(child.slot_template_name, child);
		}
	}
	return slot_names;
}