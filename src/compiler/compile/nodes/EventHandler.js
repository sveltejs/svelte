import Node from './shared/Node.js';
import Expression from './shared/Expression.js';
import { sanitize } from '../../utils/names.js';

const regex_contains_term_function_expression = /FunctionExpression/;

/** @extends Node<'EventHandler'> */
export default class EventHandler extends Node {
	/** @type {string} */
	name;

	/** @type {Set<string>} */
	modifiers;

	/** @type {import('./shared/Expression.js').default} */
	expression;

	/** @type {import('estree').Identifier} */
	handler_name;
	/** */
	uses_context = false;
	/** */
	can_make_passive = false;

	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('./shared/Node.js').default} parent
	 * @param {import('./shared/TemplateScope.js').default} template_scope
	 * @param {import('../../interfaces.js').TemplateNode} info
	 */
	constructor(component, parent, template_scope, info) {
		super(component, parent, template_scope, info);
		this.name = info.name;
		this.modifiers = new Set(info.modifiers);
		if (info.expression) {
			this.expression = new Expression(component, this, template_scope, info.expression);
			this.uses_context = this.expression.uses_context;
			if (
				regex_contains_term_function_expression.test(info.expression.type) &&
				info.expression.params.length === 0
			) {
				// TODO make this detection more accurate — if `event.preventDefault` isn't called, and
				// `event` is passed to another function, we can make it passive
				this.can_make_passive = true;
			} else if (info.expression.type === 'Identifier') {
				let node = component.node_for_declaration.get(info.expression.name);
				if (node) {
					if (node.type === 'VariableDeclaration') {
						// for `const handleClick = () => {...}`, we want the [arrow] function expression node
						const declarator = node.declarations.find(
							/** @param {any} d */
							(d) => /** @type {import('estree').Identifier} */ (d.id).name === info.expression.name
						);
						node = declarator && declarator.init;
					}
					if (
						node &&
						(node.type === 'FunctionExpression' ||
							node.type === 'FunctionDeclaration' ||
							node.type === 'ArrowFunctionExpression') &&
						node.params.length === 0
					) {
						this.can_make_passive = true;
					}
				}
			}
		} else {
			this.handler_name = component.get_unique_name(`${sanitize(this.name)}_handler`);
		}
	}

	/** @returns {boolean} */
	get reassigned() {
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
