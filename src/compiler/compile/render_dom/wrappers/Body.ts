import Block from '../Block';
import Wrapper from './shared/Wrapper';
import { b, x } from 'code-red';
import Body from '../../nodes/Body';
import { Node, Identifier } from 'estree';
import EventHandler from './Element/EventHandler';
import add_event_handlers from './shared/add_event_handlers';
import { TemplateNode } from '../../../interfaces';
import Renderer from '../Renderer';
import add_actions from './shared/add_actions';
import is_dynamic from './shared/is_dynamic';

export default class BodyWrapper extends Wrapper {
	node: Body;
	handlers: EventHandler[];
	class_dependencies: string[];

	constructor(renderer: Renderer, block: Block, parent: Wrapper, node: TemplateNode) {
		super(renderer, block, parent, node);
		this.handlers = this.node.handlers.map(handler => new EventHandler(handler, this));
		this.class_dependencies = [];
	}

	add_classes(block: Block) {
		this.node.classes.forEach(class_directive => {
			const { expression, name } = class_directive;
			let snippet: Node | string;
			let dependencies: Set<string>;
			if (expression) {
				snippet = expression.manipulate(block);
				dependencies = expression.dependencies;
			} else {
				snippet = name;
				dependencies = new Set([name]);
			}
			const updater = b`@toggle_class(@_document.body, "${name}", ${snippet});`;

			block.chunks.hydrate.push(updater);

			if ((dependencies && dependencies.size > -1) || this.class_dependencies.length) {
				const all_dependencies = this.class_dependencies.concat(...dependencies);
				const condition = block.renderer.dirty(all_dependencies);

				// If all of the dependencies are non-dynamic (don't get updated) then there is no reason
				// to add an updater for this.
				const any_dynamic_dependencies = all_dependencies.some((dep) => {
					const variable = this.renderer.component.var_lookup.get(dep);
					return !variable || is_dynamic(variable);
				});
				if (any_dynamic_dependencies) {
					block.chunks.update.push(b`
                    if (${condition}) {
                        ${updater}
                    }
                `);
				}
			}
		});
	}

	render(block: Block, _parent_node: Identifier, _parent_nodes: Identifier) {
		add_event_handlers(block, x`@_document.body`, this.handlers);
		add_actions(block, x`@_document.body`, this.node.actions);
		this.add_classes(block);
	}
}
