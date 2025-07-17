/** @import { VariableDeclaration, VariableDeclarator, Expression, CallExpression, Pattern, Identifier } from 'estree' */
/** @import { Binding } from '#compiler' */
/** @import { Context } from '../types.js' */
/** @import { ComponentAnalysis } from '../../../types.js' */
/** @import { Scope } from '../../../scope.js' */
import { build_fallback, extract_paths } from '../../../../utils/ast.js';
import * as b from '#compiler/builders';
import { get_rune } from '../../../scope.js';
import { walk } from 'zimmerframe';

/**
 * @param {VariableDeclaration} node
 * @param {Context} context
 */
export function VariableDeclaration(node, context) {
	/** @type {VariableDeclarator[]} */
	const declarations = [];

	if (context.state.analysis.runes) {
		for (const declarator of node.declarations) {
			const init = declarator.init;
			const rune = get_rune(init, context.state.scope);
			if (!rune || rune === '$effect.tracking' || rune === '$inspect' || rune === '$effect.root') {
				declarations.push(/** @type {VariableDeclarator} */ (context.visit(declarator)));
				continue;
			}

			if (rune === '$props.id') {
				// skip
				continue;
			}

			if (rune === '$props') {
				let has_rest = false;
				// remove $bindable() from props declaration
				let id = walk(declarator.id, null, {
					RestElement(node, context) {
						if (context.path.at(-1) === declarator.id) {
							has_rest = true;
						}
					},
					AssignmentPattern(node) {
						if (
							node.right.type === 'CallExpression' &&
							get_rune(node.right, context.state.scope) === '$bindable'
						) {
							const right = node.right.arguments.length
								? /** @type {Expression} */ (context.visit(node.right.arguments[0]))
								: b.void0;
							return b.assignment_pattern(node.left, right);
						}
					}
				});

				// if `$$slots` is declared separately, deconflict
				const slots_name = /** @type {ComponentAnalysis} */ (context.state.analysis).uses_slots
					? b.id('$$slots_')
					: b.id('$$slots');

				if (id.type === 'ObjectPattern' && has_rest) {
					// If a rest pattern is used within an object pattern, we need to ensure we don't expose $$slots or $$events
					id.properties.splice(
						id.properties.length - 1,
						0,
						// @ts-ignore
						b.prop('init', b.id('$$slots'), slots_name),
						b.prop('init', b.id('$$events'), b.id('$$events'))
					);
				} else if (id.type === 'Identifier') {
					// If $props is referenced as an identifier, we need to ensure we don't expose $$slots or $$events as properties
					// on the identifier reference
					id = b.object_pattern([
						b.prop('init', b.id('$$slots'), slots_name),
						b.prop('init', b.id('$$events'), b.id('$$events')),
						b.rest(b.id(id.name))
					]);
				}
				declarations.push(
					b.declarator(/** @type {Pattern} */ (context.visit(id)), b.id('$$props'))
				);
				continue;
			}

			const args = /** @type {CallExpression} */ (init).arguments;
			const value = args.length > 0 ? /** @type {Expression} */ (context.visit(args[0])) : b.void0;

			if (rune === '$derived.by') {
				declarations.push(
					b.declarator(/** @type {Pattern} */ (context.visit(declarator.id)), b.call(value))
				);
				continue;
			}

			if (declarator.id.type === 'Identifier') {
				declarations.push(b.declarator(declarator.id, value));
				continue;
			}

			if (rune === '$derived') {
				declarations.push(
					b.declarator(/** @type {Pattern} */ (context.visit(declarator.id)), value)
				);
				continue;
			}

			declarations.push(...create_state_declarators(declarator, context.state.scope, value));
		}
	} else {
		for (const declarator of node.declarations) {
			const bindings = /** @type {Binding[]} */ (context.state.scope.get_bindings(declarator));
			const has_state = bindings.some((binding) => binding.kind === 'state');
			const has_props = bindings.some((binding) => binding.kind === 'bindable_prop');

			if (!has_state && !has_props) {
				declarations.push(/** @type {VariableDeclarator} */ (context.visit(declarator)));
				continue;
			}

			if (has_props) {
				if (declarator.id.type !== 'Identifier') {
					// Turn export let into props. It's really really weird because export let { x: foo, z: [bar]} = ..
					// means that foo and bar are the props (i.e. the leafs are the prop names), not x and z.
					const tmp = b.id(context.state.scope.generate('tmp'));
					const { inserts, paths } = extract_paths(declarator.id, tmp);

					declarations.push(
						b.declarator(
							tmp,
							/** @type {Expression} */ (context.visit(/** @type {Expression} */ (declarator.init)))
						)
					);

					for (const { id, value } of inserts) {
						id.name = context.state.scope.generate('$$array');
						declarations.push(b.declarator(id, value));
					}

					for (const path of paths) {
						const value = path.expression;
						const name = /** @type {Identifier} */ (path.node).name;
						const binding = /** @type {Binding} */ (context.state.scope.get(name));
						const prop = b.member(b.id('$$props'), b.literal(binding.prop_alias ?? name), true);
						declarations.push(b.declarator(path.node, build_fallback(prop, value)));
					}

					continue;
				}

				const binding = /** @type {Binding} */ (context.state.scope.get(declarator.id.name));
				const prop = b.member(
					b.id('$$props'),
					b.literal(binding.prop_alias ?? declarator.id.name),
					true
				);

				/** @type {Expression} */
				let init = prop;
				if (declarator.init) {
					const default_value = /** @type {Expression} */ (context.visit(declarator.init));
					init = build_fallback(prop, default_value);
				}

				declarations.push(b.declarator(declarator.id, init));

				continue;
			}

			declarations.push(
				...create_state_declarators(
					declarator,
					context.state.scope,
					/** @type {Expression} */ (declarator.init && context.visit(declarator.init))
				)
			);
		}
	}

	if (declarations.length === 0) {
		return b.empty;
	}

	return {
		...node,
		declarations
	};
}

/**
 * @param {VariableDeclarator} declarator
 * @param {Scope} scope
 * @param {Expression} value
 * @returns {VariableDeclarator[]}
 */
function create_state_declarators(declarator, scope, value) {
	if (declarator.id.type === 'Identifier') {
		return [b.declarator(declarator.id, value)];
	}

	const tmp = b.id(scope.generate('tmp'));
	const { paths, inserts } = extract_paths(declarator.id, tmp);
	return [
		b.declarator(tmp, value), // TODO inject declarator for opts, so we can use it below
		...inserts.map(({ id, value }) => {
			id.name = scope.generate('$$array');
			return b.declarator(id, value);
		}),
		...paths.map((path) => {
			const value = path.expression;
			return b.declarator(path.node, value);
		})
	];
}
