import { parse } from 'acorn';
import type { OptimizeOptions } from '#compiler';
import { type NodePath, traverse, is, type Scope } from 'estree-toolkit';
import type {
	CallExpression,
	FunctionDeclaration,
	ImportDeclaration,
	VariableDeclaration,
	Node,
	Identifier,
	Function,
	BlockStatement,
	Expression
} from 'estree';
import { print } from 'esrap';
import { error } from '../errors.js';

type Props =
	| Map<string, { path: null | NodePath<VariableDeclaration>; type: 'static' | 'dynamic' }>
	| 'unknown';

interface IfBlock {
	condition: Node;
	is_static: boolean;
	type: 'if';
}

interface AwaitBlock {
	is_static: boolean;
	type: 'await';
}

interface EachBlock {
	collection: Node;
	is_static: boolean;
	type: 'each';
}

interface ComponentState {
	props: Props;
	needs_template: boolean;
	is_static: boolean;
	template: {
		open: null | NodePath<VariableDeclaration>;
		traverse: Array<NodePath<VariableDeclaration>>;
		close: null | NodePath<CallExpression>;
		components: {
			path: NodePath<CallExpression>;
			state: ComponentState;
		}[];
		blocks: Map<NodePath<CallExpression>, IfBlock | AwaitBlock | EachBlock>;
		render_effects: Map<
			NodePath<CallExpression>,
			{
				is_static: boolean;
				anchors: Set<NodePath<VariableDeclaration>>;
				expressions: Set<NodePath<VariableDeclaration>>;
			}
		>;
	};
	references: ComponentState[];
}

interface ModuleContext {
	parent: null;
	needs_template: boolean;
	type: 'module';
}

interface FunctionContext {
	parent: ModuleContext | ComponentContext | FunctionContext;
	needs_template: boolean;
	type: 'function';
}

interface ComponentContext {
	parent: ModuleContext | ComponentContext;
	needs_template: boolean;
	type: 'component';
}

interface OptimizeState {
	components: Map<NodePath<FunctionDeclaration>, ComponentState>;
	context: ModuleContext | FunctionContext | ComponentContext;
}

function visit_component(
	component: NodePath<FunctionDeclaration>,
	parent_component: null | ComponentState,
	props: Props,
	state: OptimizeState
): ComponentState {
	let component_state = state.components.get(component);
	let initial_visit = true;

	if (component_state === undefined) {
		component_state = {
			props,
			references: [],
			is_static: true,
			needs_template: state.context.needs_template,
			template: {
				open: null,
				traverse: [],
				close: null,
				components: [],
				blocks: new Map(),
				render_effects: new Map()
			}
		};
		if (parent_component !== null) {
			component_state.references.push(parent_component);
		}
		state.components.set(component, component_state);
	} else {
		initial_visit = false;
		if (state.context.needs_template && !component_state.needs_template) {
			component_state.needs_template = true;
			component_state.is_static = false;
		}
	}

	const template = component_state.template;
	const visitor = {
		CallExpression(path: NodePath<CallExpression>) {
			const callee = path.node!.callee;
			const callee_path = path.get('callee');

			if (!is.identifier(callee)) {
				return;
			}
			const callee_name = callee.name;
			const args = path.node!.arguments;
			const grand_path = path.parentPath?.parentPath;
			const blocks = component_state!.template.blocks;

			if (initial_visit) {
				// $.open
				if (
					is.variableDeclaration(grand_path) &&
					is_svelte_import(callee_path) &&
					(callee_name === 'open' || callee_name === 'open_frag') &&
					// TODO: this won't optimize slots, needs some thought
					state.context.type === 'component'
				) {
					template.open = grand_path;
				}
				// $.close
				if (
					is.expressionStatement(path.parentPath) &&
					is_svelte_import(callee_path) &&
					(callee_name === 'close' || callee_name === 'close_frag') &&
					// TODO: this won't optimize slots, needs some thought
					state.context.type === 'component'
				) {
					template.close = path;
				}
				// $.child / $.child_frag / $.sibling
				if (
					is.variableDeclaration(grand_path) &&
					is_svelte_import(callee_path) &&
					(callee_name === 'child' || callee_name === 'child_frag' || callee_name === 'sibling') &&
					state.context.type === 'component'
				) {
					template.traverse.push(grand_path);
				}
				// $.delegated_event / $.transition / $.in / $.out / $.action / $.event / $.slot / $.auto_focus / $.component / $.element
				if (
					is_svelte_import(callee_path) &&
					(callee_name === 'delegated_event' ||
						callee_name === 'transition' ||
						callee_name === 'in_fn' ||
						callee_name === 'out' ||
						callee_name === 'event' ||
						callee_name === 'action' ||
						callee_name === 'slot' ||
						callee_name === 'auto_focus' ||
						callee_name === 'component' ||
						callee_name === 'element') &&
					state.context.type === 'component'
				) {
					component_state!.is_static = false;
				}
				// $.bind_value / $.bind_content_editable / $.bind_group / $.bind_property / $.bind_scroll / $.bind_checked / $.bind_online / $.bind_this
				// TODO: these should go likey be optimized out, but bail-out for now until we have that working
				if (
					is_svelte_import(callee_path) &&
					(callee_name === 'bind_value' ||
						callee_name === 'bind_content_editable' ||
						callee_name === 'bind_group' ||
						callee_name === 'bind_property' ||
						callee_name === 'bind_scroll' ||
						callee_name === 'bind_checked' ||
						callee_name === 'bind_this' ||
						callee_name === 'bind_online') &&
					state.context.type === 'component'
				) {
					component_state!.is_static = false;
				}
				// $.source / $.derived / $.prop_source
				if (
					is.variableDeclaration(grand_path) &&
					is_svelte_import(callee_path) &&
					(callee_name === 'source' ||
						callee_name === 'prop_source' ||
						callee_name === 'derived') &&
					state.context.type === 'component'
				) {
					component_state!.is_static = false;
				}
				// $.effect / $.pre_effect
				if (
					is.expressionStatement(path.parentPath) &&
					is_svelte_import(callee_path) &&
					(callee_name === 'effect' || callee_name === 'pre_effect') &&
					state.context.type === 'component'
				) {
					component_state!.is_static = false;
				}
				// $.render_effect
				// TODO: what about detection of DOM properties that need to be client-side?
				if (
					is.expressionStatement(path.parentPath) &&
					is_svelte_import(callee_path) &&
					callee_name === 'render_effect' &&
					state.context.type === 'component'
				) {
					const closure = path.get('arguments')[0];
					let render_effect = template.render_effects.get(path);
					if (render_effect === undefined) {
						render_effect = {
							is_static: true,
							anchors: new Set(),
							expressions: new Set()
						};
						template.render_effects.set(path, render_effect);
					}
					let is_render_effect_static = true;
					closure.traverse({
						Identifier(path: NodePath<Identifier>) {
							if (is_reactive(path, props, false)) {
								is_render_effect_static = false;
							} else if (path.node!.name.includes('_anchor')) {
								const binding = path.scope!.getBinding(path.node!.name);

								if (
									binding != null &&
									is.variableDeclarator(binding.path) &&
									is.variableDeclaration(binding.path.parentPath)
								) {
									render_effect!.anchors.add(binding.path.parentPath);
								}
							} else if (path.node!.name.includes('_expression')) {
								const binding = path.scope!.getBinding(path.node!.name);

								if (
									binding != null &&
									is.variableDeclarator(binding.path) &&
									is.variableDeclaration(binding.path.parentPath)
								) {
									render_effect!.expressions.add(binding.path.parentPath);
								}
							}
						}
					});
					if (!is_render_effect_static) {
						render_effect.is_static = false;
						component_state!.is_static = false;
					}
					path.skipChildren();
				}
				// $.prop
				if (
					is.variableDeclaration(grand_path) &&
					is_svelte_import(callee_path) &&
					callee_name === 'prop' &&
					state.context.type === 'component'
				) {
					const prop_key = args[1];
					if (is.literal(prop_key) && props !== 'unknown') {
						const prop = props.get(prop_key.value as string);
						if (prop !== undefined) {
							prop.path = grand_path;
							if (prop.type === 'dynamic') {
								component_state!.is_static = false;
							}
						}
					} else {
						component_state!.is_static = false;
					}
				}
			}
			// $.if
			if (
				is.expressionStatement(path.parentPath) &&
				is_svelte_import(callee_path) &&
				callee_name.startsWith('if_block')
			) {
				let condition = path.get('arguments')[1] as NodePath<Expression>;
				if (is.arrowFunctionExpression(condition)) {
					condition = condition.get('body') as NodePath<Expression>;
				}
				const is_static = !state.context.needs_template && !is_reactive(condition, props, false);
				let if_block = blocks.get(path) as undefined | IfBlock;

				if (if_block === undefined) {
					if_block = {
						condition: condition.node!,
						is_static,
						type: 'if'
					};
					blocks.set(path, if_block);
				} else if (!is_static) {
					if_block.is_static = false;
				}
				path.skipChildren();
				if (!if_block.is_static) {
					component_state!.is_static = false;
					const consequent_fn = path.get('arguments')[0];
					const alternate_fn = path.get('arguments')[1];
					const prev_needs_template = state.context.needs_template;
					state.context.needs_template = true;
					if (is.function(consequent_fn)) {
						consequent_fn.traverse(visitor);
					}
					if (is.function(alternate_fn)) {
						alternate_fn.traverse(visitor);
					}
					state.context.needs_template = prev_needs_template;
				}
			}
			// $.await
			if (
				is.expressionStatement(path.parentPath) &&
				is_svelte_import(callee_path) &&
				callee_name === 'await_block'
			) {
				component_state!.is_static = false;
			}
			// $.key
			if (
				is.expressionStatement(path.parentPath) &&
				is_svelte_import(callee_path) &&
				callee_name === 'key'
			) {
				component_state!.is_static = false;
			}
			// $.each
			if (
				is.expressionStatement(path.parentPath) &&
				is_svelte_import(callee_path) &&
				callee_name === 'each'
			) {
				let collection = path.get('arguments')[1] as NodePath<Expression>;
				if (is.arrowFunctionExpression(collection)) {
					collection = collection.get('body') as NodePath<Expression>;
				}
				const is_static = !state.context.needs_template && !is_reactive(collection, props, false);
				let each_block = blocks.get(path) as undefined | EachBlock;

				if (each_block === undefined) {
					each_block = {
						collection: collection.node!,
						is_static,
						type: 'each'
					};
					blocks.set(path, each_block);
				} else {
					error(null, 'TODO', '');
				}
				path.skipChildren();
				if (!each_block.is_static) {
					component_state!.is_static = false;
					const each_fn = path.get('arguments')[4];
					const else_fn = path.get('arguments')[5];
					const prev_needs_template = state.context.needs_template;
					state.context.needs_template = true;
					if (is.function(each_fn)) {
						each_fn.traverse(visitor);
					}
					if (is.function(else_fn)) {
						else_fn.traverse(visitor);
					}
					state.context.needs_template = prev_needs_template;
				}
			}
			// <Component />
			if (
				callee_name[0] === callee_name[0].toUpperCase() &&
				is.expressionStatement(path.parentPath)
			) {
				const binding = path.scope!.getBinding(callee_name);
				if (
					binding != null &&
					is.functionDeclaration(binding.path) &&
					binding.path.node!.params.length === 3 &&
					is.identifier(binding.path.node!.params[1]) &&
					binding.path.node!.params[1].name === '$$props'
				) {
					const context: ComponentContext = {
						parent: state.context as ComponentContext,
						needs_template: state.context.needs_template,
						type: 'component'
					};
					state.context = context;
					const child_props = get_props(path.get('arguments')[1], props);
					const child_component_state = visit_component(
						binding.path,
						component_state!,
						child_props,
						state
					);
					if (!child_component_state.is_static) {
						component_state!.is_static = false;
					}
					template.components.push({
						path,
						state: child_component_state
					});
					state.context = state.context.parent;
				}
			}
		},
		Function: {
			enter(path: NodePath<Function>) {
				if (path !== component) {
					const context: FunctionContext = {
						needs_template: state.context.needs_template,
						parent: state.context as ComponentContext | FunctionContext | ModuleContext,
						type: 'function'
					};
					state.context = context;
				}
			},
			leave(path: NodePath<Function>) {
				if (path !== component) {
					state.context = state.context.parent as
						| ComponentContext
						| FunctionContext
						| ModuleContext;
				}
			}
		}
	};

	component.traverse(visitor);
	return component_state;
}

function get_props(props_arg: NodePath<Node>, parent_props: Props | null): Props {
	const props: Props = new Map();

	if (is.objectExpression(props_arg)) {
		for (const property of props_arg.get('properties')) {
			if (
				is.property(property) &&
				(is.identifier(property.node!.key) || is.literal(property.node!.key))
			) {
				const value = property.get('value');
				const kind = property.node!.kind;
				if (kind === 'init') {
					const dynamic = is_reactive(value, parent_props, true);
					props.set(
						is.literal(property.node!.key)
							? (property.node!.key.value as string)
							: property.node!.key.name,
						{
							type: dynamic ? 'dynamic' : 'static',
							path: null
						}
					);
				} else if (
					kind === 'get' &&
					is.functionExpression(value) &&
					value.node!.body.body.length === 1 &&
					is.returnStatement(value.node!.body.body[0])
				) {
					const expression = (value.get('body') as NodePath<BlockStatement>)
						.get('body')[0]
						.get('argument') as NodePath<Expression>;
					const dynamic = is_reactive(expression, parent_props, true);
					props.set(
						is.literal(property.node!.key)
							? (property.node!.key.value as string)
							: property.node!.key.name,
						{
							type: dynamic ? 'dynamic' : 'static',
							path: null
						}
					);
				} else {
					return 'unknown';
				}
			} else {
				// TODO
				error(null, 'TODO', '');
				return 'unknown';
			}
		}
	} else {
		// TODO
		error(null, 'TODO', '');
		return 'unknown';
	}
	return props;
}

function is_reactive(
	path: NodePath<Node>,
	props: Props | null,
	functions_are_reactive: boolean
): boolean {
	if (is.identifier(path)) {
		const binding = path.scope!.getBinding(path.node!.name);
		if (binding != null && is.variableDeclarator(binding.path)) {
			const init = binding.path.get('init');
			if (init.node! !== null && is_reactive(init, props, functions_are_reactive)) {
				return true;
			}
		}
	} else if (is.literal(path)) {
		return false;
	} else if (is.unaryExpression(path)) {
		if (is_reactive(path.get('argument'), props, functions_are_reactive)) {
			return true;
		}
	} else if (is.updateExpression(path)) {
		if (is_reactive(path.get('argument'), props, functions_are_reactive)) {
			return true;
		}
	} else if (is.assignmentExpression(path)) {
		if (is_reactive(path.get('left'), props, functions_are_reactive)) {
			return true;
		}
		if (is_reactive(path.get('right'), props, functions_are_reactive)) {
			return true;
		}
	} else if (is.sequenceExpression(path)) {
		for (const expression of path.get('expressions')) {
			if (is_reactive(expression, props, functions_are_reactive)) {
				return true;
			}
		}
	} else if (is.conditionalExpression(path)) {
		if (is_reactive(path.get('test'), props, functions_are_reactive)) {
			return true;
		}
		if (is_reactive(path.get('consequent'), props, functions_are_reactive)) {
			return true;
		}
		if (is_reactive(path.get('alternate'), props, functions_are_reactive)) {
			return true;
		}
	} else if (is.binaryExpression(path)) {
		if (is_reactive(path.get('left'), props, functions_are_reactive)) {
			return true;
		}
		if (is_reactive(path.get('right'), props, functions_are_reactive)) {
			return true;
		}
	} else if (is.logicalExpression(path)) {
		if (is_reactive(path.get('left'), props, functions_are_reactive)) {
			return true;
		}
		if (is_reactive(path.get('right'), props, functions_are_reactive)) {
			return true;
		}
	} else if (is.arrayExpression(path)) {
		for (const element of path.get('elements')) {
			if (element !== null && is_reactive(element, props, functions_are_reactive)) {
				return true;
			}
		}
	} else if (is.objectExpression(path)) {
		for (const property of path.get('properties')) {
			if (is_reactive(property, props, functions_are_reactive)) {
				return true;
			}
		}
	} else if (is.function(path)) {
		return functions_are_reactive;
	} else if (is.callExpression(path)) {
		if (is.identifier(path.node!.callee)) {
			const prop_key = path.node!.arguments[1];
			const callee_name = path.node!.callee.name;
			// Check if prop
			if (
				is.variableDeclaration(path.parentPath?.parentPath) &&
				is_svelte_import(path.get('callee')) &&
				callee_name === 'prop' &&
				is.literal(prop_key) &&
				props !== 'unknown' &&
				props !== null
			) {
				const prop = props.get(prop_key.value as string);
				if (prop !== undefined && prop.type === 'static') {
					return false;
				}
			}
			// Check if referencing prop
			const binding = path.scope!.getBinding(callee_name);
			if (binding != null) {
				if (
					is.variableDeclarator(binding.path) &&
					is.variableDeclaration(binding.path.parentPath) &&
					is.callExpression(binding.path.node!.init) &&
					is.identifier(binding.path.node!.init.callee) &&
					binding.path.node!.init.callee.name === 'prop' &&
					is_svelte_import((binding.path.get('init') as NodePath<CallExpression>).get('callee')) &&
					is.literal(binding.path.node!.init.arguments[1]) &&
					props !== 'unknown' &&
					props !== null
				) {
					const prop = props.get(binding.path.node!.init.arguments[1].value as string);
					if (prop !== undefined && prop.type === 'static') {
						return false;
					}
				}
			}
			// Check if template
			if (
				is.variableDeclaration(path.parentPath?.parentPath) &&
				is_svelte_import(path.get('callee')) &&
				(callee_name === 'child' || callee_name === 'child_frag' || callee_name === 'sibling')
			) {
				return false;
			}
		}

		return true;
	} else if (is.memberExpression(path)) {
		return true;
	} else {
		error(null, 'TODO', '');
	}
	return false;
}

function is_svelte_import(path: NodePath<Node>): boolean {
	if (is.identifier(path)) {
		const binding = path.scope!.getBinding(path.node!.name);
		if (binding != null && is.importSpecifier(binding.path)) {
			const import_declaration = binding.path.parentPath as NodePath<ImportDeclaration>;
			if ((import_declaration.node!.source.value as string).includes('vendor')) {
				return true;
			}
		}
	}
	return false;
}

function is_removed(path: NodePath<Node>): boolean {
	let current_path: null | NodePath<Node> = path;
	while (current_path !== null) {
		if (current_path.removed) {
			return true;
		}
		current_path = current_path.parentPath as null | NodePath<Node>;
	}
	return false;
}

function has_references(name: string, scope: Scope): boolean {
	const binding = scope.getBinding(name)!;
	let has_references = false;
	for (const reference of binding.references) {
		if (!is_removed(reference)) {
			has_references = true;
			break;
		}
	}
	return has_references;
}

function optimize_component(component_state: ComponentState): void {
	const template = component_state.template;
	const is_static = component_state.is_static;
	if (template.open !== null) {
		const arg_to_remove = template.open
			.get('declarations')[0]
			.get('init')
			.get('arguments')[1] as NodePath<Identifier>;
		const template_path = arg_to_remove.scope!.getBinding(arg_to_remove.node!.name)!.path
			.parentPath!;
		template_path.remove();
		if (is_static) {
			template.open.remove();
		} else {
			arg_to_remove.remove();
		}
	}
	if (is_static && template.close !== null) {
		template.close.remove();
	}
	for (const [path, render_effect] of template.render_effects) {
		if (render_effect.is_static) {
			path.remove();
			for (const anchor of render_effect.anchors) {
				anchor.remove();
			}
			for (const expression of render_effect.expressions) {
				expression.remove();
			}
		}
	}
	for (const [block_path, block] of template.blocks) {
		if (is_static || block.is_static) {
			if (block.type === 'each') {
				const collection = block.collection;
				if (is.identifier(collection)) {
					const binding = block_path.scope!.getBinding(collection.name);
					if (binding != null && binding.references.length === 1) {
						binding.path.remove();
					}
				}
			}
			// remove the block
			block_path.remove();
		}
	}
	const reverse_template = template.traverse.slice().reverse();
	for (const path of reverse_template) {
		const id = path.node!.declarations[0].id! as Identifier;
		if (is_static || !has_references(id.name, path.scope!)) {
			if (!path.removed) {
				path.remove();
			}
		}
	}
	for (const { path, state } of template.components) {
		if (state.is_static) {
			path.parentPath?.getPrevSibling()?.remove();
		}
	}
	if (component_state.props !== 'unknown') {
		for (const [prop, { path, type }] of component_state.props) {
			if (type === 'static' && path !== null && !has_references(prop, path.scope!)) {
				path.remove();
			}
		}
	}
}

function is_optimizable(component_state: ComponentState): boolean {
	if (component_state.needs_template || component_state.props === 'unknown') {
		return false;
	}
	for (const [, { type }] of component_state.props) {
		if (type === 'dynamic') {
			return false;
		}
	}
	return true;
}

export function optimize_chunk(source: string, options: OptimizeOptions): string | null {
	const ast = parse(source, {
		sourceType: 'module',
		ecmaVersion: 13,
		locations: true
	});

	const context: ModuleContext = {
		parent: null,
		needs_template: !options.hydrate,
		type: 'module'
	};
	const state: OptimizeState = {
		components: new Map(),
		context
	};

	traverse(ast, {
		$: { scope: true },
		CallExpression(path: NodePath<CallExpression>) {
			// TODO: mount signature changed, this needs updating
			// Find the root component from a `mount(() => component(...), container)` call
			const node = path.node!;
			const callee = node.callee;
			const args = node.arguments;
			const first_arg = path.get('arguments')[0];

			if (
				is.identifier(callee) &&
				callee.name === 'mount' &&
				args.length === 2 &&
				is.arrowFunctionExpression(first_arg) &&
				is.callExpression(first_arg.node!.body)
			) {
				if (!is_svelte_import(path.get('callee'))) {
					return;
				}
				const body = first_arg.get('body') as NodePath<CallExpression>;
				const component_callee = body.node!.callee;
				const component_args = body.node!.arguments[1];

				if (!is.identifier(component_callee) || component_args == null) {
					return;
				}
				const component_binding = path.scope!.getBinding(component_callee.name);

				if (
					component_binding == null ||
					!is.functionDeclaration(component_binding.path) ||
					component_binding.references.length !== 1
				) {
					return;
				}
				const component = component_binding.path;
				const component_node = component.node!;

				if (
					component_node.params.length !== 3 ||
					!is.identifier(component_node.params[1]) ||
					component_node.params[1].name !== '$$props'
				) {
					return;
				}

				// We have the root render node
				const context: ComponentContext = {
					parent: state.context as ModuleContext,
					needs_template: state.context.needs_template,
					type: 'component'
				};
				state.context = context;
				const props = get_props(body.get('arguments')[1], null);
				visit_component(component, null, props, state);
				state.context = state.context.parent;
			}
		}
	});

	for (const [, component_state] of state.components) {
		if (is_optimizable(component_state)) {
			optimize_component(component_state);
		}
	}

	return print(ast as Node).code;
}
