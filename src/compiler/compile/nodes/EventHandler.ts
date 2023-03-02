import Node from './shared/Node';
import Expression from './shared/Expression';
import Component from '../Component';
import { Identifier } from 'estree';
import TemplateScope from './shared/TemplateScope';
import { TemplateNode } from '../../interfaces';
import compiler_errors from '../compiler_errors';
import compiler_warnings from '../compiler_warnings';
import list from '../../utils/list';

const regex_contains_term_function_expression = /FunctionExpression/;

const valid_modifiers = new Set([
	'preventDefault',
	'stopPropagation',
	'stopImmediatePropagation',
	'capture',
	'once',
	'passive',
	'nonpassive',
	'self',
	'trusted'
]);

const passive_events = new Set([
	'wheel',
	'touchstart',
	'touchmove',
	'touchend',
	'touchcancel'
]);

export default class EventHandler extends Node {
	type: 'EventHandler';
	name: string;
	modifiers: Set<string>;
	expression: Expression;
	aliasName?: string;
	aliasCount: 0;
	uses_context = false;
	can_make_passive = false;

	constructor(component: Component, parent: Node, template_scope: TemplateScope, info: TemplateNode) {
		super(component, parent, template_scope, info);

		this.name = info.name;
		this.modifiers = new Set(info.modifiers);

		if (info.expression) {
			this.expression = new Expression(component, this, template_scope, info.expression);
			this.uses_context = this.expression.uses_context;

			if (regex_contains_term_function_expression.test(info.expression.type) && info.expression.params.length === 0) {
				// TODO make this detection more accurate — if `event.preventDefault` isn't called, and
				// `event` is passed to another function, we can make it passive
				this.can_make_passive = true;
			} else if (info.expression.type === 'Identifier') {
				let node = component.node_for_declaration.get(info.expression.name);

				if (node) {
					if (node.type === 'VariableDeclaration') {
						// for `const handleClick = () => {...}`, we want the [arrow] function expression node
						const declarator = node.declarations.find(d => (d.id as Identifier).name === info.expression.name);
						node = declarator && declarator.init;
					}

					if (node && (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression') && node.params.length === 0) {
						this.can_make_passive = true;
					}
				}
			}
		} else {
			if (info.modifiers && info.modifiers.length) {
				this.aliasCount = info.modifiers.length;
				this.aliasName = info.modifiers[0];
			}
		}
	}

	validate() {
		if (this.expression) {
			if (this.modifiers.has('passive') && this.modifiers.has('preventDefault')) {
				return this.component.error(this, compiler_errors.invalid_event_modifier_combination('passive', 'preventDefault'));
			}
	
			if (this.modifiers.has('passive') && this.modifiers.has('nonpassive')) {
				return this.component.error(this, compiler_errors.invalid_event_modifier_combination('passive', 'nonpassive'));
			}
	
			this.modifiers.forEach(modifier => {
				if (!valid_modifiers.has(modifier)) {
					return this.component.error(this, compiler_errors.invalid_event_modifier(list(Array.from(valid_modifiers))));
				}
	
				if (modifier === 'passive') {
					if (passive_events.has(this.name)) {
						if (this.can_make_passive) {
							this.component.warn(this, compiler_warnings.redundant_event_modifier_for_touch);
						}
					} else {
						this.component.warn(this, compiler_warnings.redundant_event_modifier_passive);
					}
				}
	
				if (this.component.compile_options.legacy && (modifier === 'once' || modifier === 'passive')) {
					// TODO this could be supported, but it would need a few changes to
					// how event listeners work
					return this.component.error(this, compiler_errors.invalid_event_modifier_legacy(modifier));
				}
			});
	
			if (passive_events.has(this.name) && this.can_make_passive && !this.modifiers.has('preventDefault') && !this.modifiers.has('nonpassive')) {
				// touch/wheel events should be passive by default
				this.modifiers.add('passive');
			}
		} else {
			if (this.aliasCount > 1) {
				return this.component.error(this, compiler_errors.too_much_forward_event_modifiers);
			}
			if (this.aliasName && valid_modifiers.has(this.aliasName)) {
				this.component.warn(this, compiler_warnings.incorrect_forward_event_modifier(valid_modifiers));
			}
		}
	}

	get reassigned(): boolean {
		if (!this.expression) {
			return false;
		}
		const node = this.expression.node;

		if (regex_contains_term_function_expression.test(node.type)) {
			return false;
		}

		return this.expression.dynamic_dependencies().length > 0;
	}
}
