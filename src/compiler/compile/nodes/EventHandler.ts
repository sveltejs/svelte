import Node from './shared/Node';
import Expression from './shared/Expression';
import Component from '../Component';
import deindent from '../utils/deindent';
import Block from '../render_dom/Block';
import { sanitize } from '../../utils/names';

export default class EventHandler extends Node {
	type: 'EventHandler';
	name: string;
	modifiers: Set<string>;
	expression: Expression;
	handler_name: string;
	uses_context = false;
	can_make_passive = false;

	constructor(component: Component, parent, template_scope, info) {
		super(component, parent, template_scope, info);

		this.name = info.name;
		this.modifiers = new Set(info.modifiers);

		if (info.expression) {
			this.expression = new Expression(component, this, template_scope, info.expression);
			this.uses_context = this.expression.uses_context;

			if (/FunctionExpression/.test(info.expression.type) && info.expression.params.length === 0) {
				// TODO make this detection more accurate — if `event.preventDefault` isn't called, and
				// `event` is passed to another function, we can make it passive
				this.can_make_passive = true;
			} else if (info.expression.type === 'Identifier') {
				let node = component.node_for_declaration.get(info.expression.name);

				if (node && node.type === 'VariableDeclaration') {
					// for `const handleClick = () => {...}`, we want the [arrow] function expression node
					const declarator = node.declarations.find(d => d.id.name === info.expression.name);
					node = declarator && declarator.init;
				}

				if (node && /Function/.test(node.type) && node.params.length === 0) {
					this.can_make_passive = true;
				}
			}
		} else {
			const name = component.get_unique_name(`${sanitize(this.name)}_handler`);

			component.add_var({
				name,
				internal: true,
				referenced: true
			});

			component.partly_hoisted.push(deindent`
				function ${name}(event) {
					@bubble($$self, event);
				}
			`);

			this.handler_name = name;
		}
	}

	// TODO move this? it is specific to render-dom
	render(block: Block) {
		if (this.expression) return this.expression.render(block);

		// this.component.add_reference(this.handler_name);
		return `ctx.${this.handler_name}`;
	}
}
