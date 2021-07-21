import Element from './Element';
import Attribute from './Attribute';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { INode } from './interfaces';
import { TemplateNode } from '../../interfaces';
import compiler_errors from '../compiler_errors';

export default class Slot extends Element {
	type: 'Element';
	name: string;
	children: INode[];
	slot_name: string;
	values: Map<string, Attribute> = new Map();

	constructor(component: Component, parent: INode, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		info.attributes.forEach(attr => {
			if (attr.type !== 'Attribute' && attr.type !== 'Spread') {
				return component.error(attr, compiler_errors.invalid_slot_directive);
			}

			if (attr.name === 'name') {
				if (attr.value.length !== 1 || attr.value[0].type !== 'Text') {
					return component.error(attr, compiler_errors.dynamic_slot_name);
				}

				this.slot_name = attr.value[0].data;
				if (this.slot_name === 'default') {
					return component.error(attr, compiler_errors.invalid_slot_name);
				}
			}

			this.values.set(attr.name, new Attribute(component, this, scope, attr));
		});

		if (!this.slot_name) this.slot_name = 'default';

		component.slots.set(this.slot_name, this);
	}
}
