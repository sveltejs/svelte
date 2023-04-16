import Element from './Element';
import Attribute from './Attribute';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { INode } from './interfaces';
import { TemplateNode, Attribute as AttributeNode } from '../../interfaces';
import compiler_errors from '../compiler_errors';

export default class Slot extends Element {
	type: 'Element';
	name: string;
	children: INode[];
	slot_name: string;
	name_attribute: Attribute;
	values: Map<string, Attribute> = new Map();

	constructor(component: Component, parent: INode, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		info.attributes.forEach((attr: AttributeNode) => {
			if (attr.type !== 'Attribute' && attr.type !== 'Spread') {
				return component.error(attr, compiler_errors.invalid_slot_directive);
			}
      
			const new_attribute = new Attribute(component, this, scope, attr);
			if (attr.name === 'name') {
				if (attr.value.length === 1 && attr.value[0].type === 'Text') {
					this.slot_name = attr.value[0].data;
				} else {
					this.slot_name = component.get_unique_name('dynamic_slot_name').name;
				}

				if (this.slot_name === 'default') {
					return component.error(attr, compiler_errors.invalid_slot_name);
				}

        this.name_attribute = new_attribute;
			}

			this.values.set(attr.name, new_attribute);
		});

		if (!this.slot_name) {
			// If there is no name attribute, pretend we do have a name attribute with value 'default'
			this.slot_name = 'default';
			this.name_attribute = new Attribute(component, this, scope, {
				type: 'Attribute',
				name: 'name',
				value: [ { type: 'Text', data: 'default' } ]
			} as AttributeNode);
		}

		if (this.slot_name === 'default') {
			// if this is the default slot, add our dependencies to any
			// other slots (which inherit our slot values) that were
			// previously encountered
			component.slots.forEach((slot) => {
				this.values.forEach((attribute, name) => {
					if (!slot.values.has(name)) {
						slot.values.set(name, attribute);
					}
				});
			});
		} else if (component.slots.has('default')) {
			// otherwise, go the other way — inherit values from
			// a previously encountered default slot
			const default_slot = component.slots.get('default');
			default_slot.values.forEach((attribute, name) => {
				if (!this.values.has(name)) {
					this.values.set(name, attribute);
				}
			});
		}

		component.slots.set(this.slot_name, this);
	}
}
