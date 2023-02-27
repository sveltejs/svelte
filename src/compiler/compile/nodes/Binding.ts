import Node from './shared/Node';
import get_object from '../utils/get_object';
import Expression from './shared/Expression';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { regex_dimensions } from '../../utils/patterns';
import { Node as ESTreeNode } from 'estree';
import { TemplateNode } from '../../interfaces';
import Element from './Element';
import InlineComponent from './InlineComponent';
import Window from './Window';
import { clone } from '../../utils/clone';
import compiler_errors from '../compiler_errors';
import compiler_warnings from '../compiler_warnings';

// TODO this should live in a specific binding
const read_only_media_attributes = new Set([
	'duration',
	'buffered',
	'seekable',
	'played',
	'seeking',
	'ended',
	'videoHeight',
	'videoWidth',
	'naturalWidth',
	'naturalHeight',
	'readyState'
]);

export default class Binding extends Node {
	type: 'Binding';
	name: string;
	expression: Expression;
	raw_expression: ESTreeNode; // TODO exists only for bind:this — is there a more elegant solution?
	is_contextual: boolean;
	is_readonly: boolean;

	constructor(component: Component, parent: Element | InlineComponent | Window, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		if (info.expression.type !== 'Identifier' && info.expression.type !== 'MemberExpression') {
			component.error(info, compiler_errors.invalid_directive_value);
			return;
		}

		this.name = info.name;
		this.expression = new Expression(component, this, scope, info.expression);
		this.raw_expression = clone(info.expression);

		const { name } = get_object(this.expression.node);

		this.is_contextual = Array.from(this.expression.references).some(name => scope.names.has(name));
		if (this.is_contextual) this.validate_binding_rest_properties(scope);

		// make sure we track this as a mutable ref
		if (scope.is_let(name)) {
			component.error(this, compiler_errors.invalid_binding_let);
			return;
		} else if (scope.names.has(name)) {
			if (scope.is_await(name)) {
				component.error(this, compiler_errors.invalid_binding_await);
				return;
			}
			if (scope.is_const(name)) {
				component.error(this, compiler_errors.invalid_binding_const);
			}

			scope.dependencies_for_name.get(name).forEach(name => {
				const variable = component.var_lookup.get(name);
				if (variable) {
					variable.mutated = true;
				}
			});
		} else {
			const variable = component.var_lookup.get(name);

			if (!variable || variable.global) {
				component.error(this.expression.node as any, compiler_errors.binding_undeclared(name));
				return;
			}

			variable[this.expression.node.type === 'MemberExpression' ? 'mutated' : 'reassigned'] = true;

			if (info.expression.type === 'Identifier' && !variable.writable) {
				component.error(this.expression.node as any, compiler_errors.invalid_binding_writable);
				return;
			}
		}

		const type = parent.get_static_attribute_value('type');

		this.is_readonly =
			regex_dimensions.test(this.name) ||
			(isElement(parent) &&
				((parent.is_media_node() && read_only_media_attributes.has(this.name)) ||
					(parent.name === 'input' && type === 'file')) /* TODO others? */);
	}

	is_readonly_media_attribute() {
		return read_only_media_attributes.has(this.name);
	}

	validate_binding_rest_properties(scope: TemplateScope) {
		this.expression.references.forEach(name => {
			const each_block = scope.get_owner(name);
			if (each_block && each_block.type === 'EachBlock') {
				const rest_node = each_block.context_rest_properties.get(name);
				if (rest_node) {
					this.component.warn(rest_node as any, compiler_warnings.invalid_rest_eachblock_binding(name));
				}
			}
		});
	}
}

function isElement(node: Node): node is Element {
	return !!(node as any).is_media_node;
}
