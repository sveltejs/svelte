import list from '../../utils/list.js';
import compiler_errors from '../compiler_errors.js';
import { nodes_to_template_literal } from '../utils/nodes_to_template_literal.js';
import Expression from './shared/Expression.js';
import Node from './shared/Node.js';

const valid_modifiers = new Set(['important']);

/** @extends Node<'StyleDirective'> */
export default class StyleDirective extends Node {
	/** @type {string} */
	name;

	/** @type {Set<string>} */
	modifiers;

	/** @type {import('./shared/Expression.js').default} */
	expression;

	/** @type {boolean} */
	should_cache;

	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('./shared/Node.js').default} parent
	 * @param {import('./shared/TemplateScope.js').default} scope
	 * @param {import('../../interfaces.js').TemplateNode} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.name = info.name;
		this.modifiers = new Set(info.modifiers);
		for (const modifier of this.modifiers) {
			if (!valid_modifiers.has(modifier)) {
				component.error(
					this,
					compiler_errors.invalid_style_directive_modifier(list([...valid_modifiers]))
				);
			}
		}
		// Convert the value array to an expression so it's easier to handle
		// the StyleDirective going forward.
		if (info.value === true || (info.value.length === 1 && info.value[0].type === 'MustacheTag')) {
			const identifier =
				info.value === true
					? {
							type: 'Identifier',
							start: info.end - info.name.length,
							end: info.end,
							name: info.name
					  }
					: info.value[0].expression;
			this.expression = new Expression(component, this, scope, identifier);
			this.should_cache = false;
		} else {
			const raw_expression = nodes_to_template_literal(info.value);
			this.expression = new Expression(component, this, scope, raw_expression);
			this.should_cache = raw_expression.expressions.length > 0;
		}
	}
	get important() {
		return this.modifiers.has('important');
	}
}
