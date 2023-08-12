import Node from './shared/Node.js';
import get_object from '../utils/get_object.js';
import Expression from './shared/Expression.js';
import { regex_dimensions, regex_box_size } from '../../utils/patterns.js';
import { clone } from '../../utils/clone.js';
import compiler_errors from '../compiler_errors.js';
import compiler_warnings from '../compiler_warnings.js';

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

/** @extends Node<'Binding'> */
export default class Binding extends Node {
	/** @type {string} */
	name;

	/** @type {import('./shared/Expression.js').default} */
	expression;

	/** @type {import('estree').Node} */
	raw_expression; // TODO exists only for bind:this — is there a more elegant solution?

	/** @type {boolean} */
	is_contextual;

	/** @type {boolean} */
	is_readonly;

	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('./Element.js').default | import('./InlineComponent.js').default | import('./Window.js').default | import('./Document.js').default} parent
	 * @param {import('./shared/TemplateScope.js').default} scope
	 * @param {import('../../interfaces.js').TemplateNode} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		if (info.expression.type !== 'Identifier' && info.expression.type !== 'MemberExpression') {
			component.error(info, compiler_errors.invalid_directive_value);
			return;
		}
		this.name = info.name;
		this.expression = new Expression(component, this, scope, info.expression);
		this.raw_expression = clone(info.expression);
		const { name } = get_object(this.expression.node);
		this.is_contextual = Array.from(this.expression.references).some((name) =>
			scope.names.has(name)
		);
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
			scope.dependencies_for_name.get(name).forEach((name) => {
				const variable = component.var_lookup.get(name);
				if (variable) {
					variable.mutated = true;
				}
			});
		} else {
			const variable = component.var_lookup.get(name);
			if (!variable || variable.global) {
				component.error(
					/** @type {any} */ (this.expression.node),
					compiler_errors.binding_undeclared(name)
				);
				return;
			}
			variable[this.expression.node.type === 'MemberExpression' ? 'mutated' : 'reassigned'] = true;
			if (info.expression.type === 'Identifier' && !variable.writable) {
				component.error(
					/** @type {any} */ (this.expression.node),
					compiler_errors.invalid_binding_writable
				);
				return;
			}
		}
		const type = parent.get_static_attribute_value('type');
		this.is_readonly =
			regex_dimensions.test(this.name) ||
			regex_box_size.test(this.name) ||
			(isElement(parent) &&
				((parent.is_media_node() && read_only_media_attributes.has(this.name)) ||
					(parent.name === 'input' && type === 'file'))) /* TODO others? */;
	}
	is_readonly_media_attribute() {
		return read_only_media_attributes.has(this.name);
	}

	/** @param {import('./shared/TemplateScope.js').default} scope */
	validate_binding_rest_properties(scope) {
		this.expression.references.forEach((name) => {
			const each_block = scope.get_owner(name);
			if (each_block && each_block.type === 'EachBlock') {
				const rest_node = each_block.context_rest_properties.get(name);
				if (rest_node) {
					this.component.warn(
						/** @type {any} */ (rest_node),
						compiler_warnings.invalid_rest_eachblock_binding(name)
					);
				}
			}
		});
	}
}

/**
 * @param {import('./shared/Node.js').default} node
 * @returns {node is import('./Element.js').default}
 */
function isElement(node) {
	return !!(/** @type {any} */ (node).is_media_node);
}
