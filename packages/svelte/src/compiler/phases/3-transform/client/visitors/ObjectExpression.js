/** @import { ObjectExpression, Property, CallExpression, Expression, SpreadElement, Node, Identifier, PrivateIdentifier, Statement } from 'estree' */
/** @import { Context } from '../types' */
import * as b from '../../../../utils/builders.js';
import { get_rune } from '../../../scope.js';
import { should_proxy } from '../utils.js';
import { walk } from 'zimmerframe';

/**
 * @param {ObjectExpression} node
 * @param {Context} context
 */
export function ObjectExpression(node, context) {
	/**
	 * @typedef {[string, NonNullable<ReturnType<typeof get_rune>>, '$.state' | '$.derived', Expression, boolean]} ReactiveProperty
	 */
	let has_runes = false;
	/**
	 * @type {Array<{rune: NonNullable<ReturnType<typeof get_rune>>, property: Property & {value: CallExpression}}>}
	 */
	const reactive_properties = [];
	const valid_property_runes = ['$state', '$derived', '$state.raw', '$derived.by'];
	for (let property of node.properties) {
		if (property.type !== 'Property') continue;
		const rune = get_rune(property.value, context.state.scope);
		if (rune && valid_property_runes.includes(rune)) {
			has_runes = true;
			reactive_properties.push({
				rune,
				property: /**@type {Property & {value: CallExpression}} */ (property)
			});
		}
	}
	if (!has_runes) {
		context.next();
		return;
	}
	/** @type {Statement[]} */
	const body = [];
	/** @type {Map<Property, ReactiveProperty>} */
	const sources = new Map();
	let has_this_reference = false;
	let counter = 0;
	/** @type {Statement[]} */
	const before = [];
	/** @type {Statement[]} */
	const after = [];
	/** @type {string[]} */
	const declarations = [];
	/** @type {Map<string, Expression | undefined>} */
	const initial_declarations = new Map();
	// if a computed property is accessed, we treat it as if all of the object's properties have been accessed
	let all_are_referenced = false;
	/** @type {Set<any>} */
	const is_referenced = new Set();
	for (let property of node.properties) {
		walk(property, null, {
			//@ts-ignore
			FunctionExpression() {
				return;
			},
			//@ts-ignore
			FunctionDeclaration() {
				return;
			},
			ObjectExpression() {
				return;
			},
			/**
			 *
			 * @param {Node} node
			 * @param {import('zimmerframe').Context<Node, null>} context
			 */
			ThisExpression(node, context) {
				const parent = context.path.at(-1);
				if (parent?.type === 'MemberExpression') {
					if (parent.computed) {
						all_are_referenced = true;
					} else {
						is_referenced.add(/** @type {Identifier | PrivateIdentifier} */ (parent.property).name);
					}
				}
			},
			ClassBody() {
				return;
			}
		});
	}
	for (let { rune, property } of reactive_properties) {
		const name = context.state.scope.generate(`$$${++counter}`);
		const call = rune.match(/^\$state/) ? '$.state' : '$.derived';
		let references_this = false;
		/** @type {Expression} */
		let value = /** @type {Expression} */ (context.visit(property.value.arguments[0] ?? b.void0));
		value = walk(value, null, {
			FunctionExpression() {
				return;
			},
			//@ts-ignore
			FunctionDeclaration() {
				return;
			},
			ObjectExpression() {
				return;
			},
			ThisExpression() {
				has_this_reference = true;
				references_this = true;
				return b.id('$$object');
			},
			ClassBody() {
				return;
			}
		});
		value =
			rune === '$derived'
				? b.thunk(value)
				: rune === '$state' && should_proxy(value, context.state.scope)
					? b.call('$.proxy', value)
					: value;
		let key = property.computed
			? Symbol()
			: property.key.type === 'Literal'
				? property.key.value
				: /** @type {Identifier} */ (property.key).name;
		if (rune.match(/^\$state/) && !(all_are_referenced || is_referenced.has(key))) {
			let should_be_declared = false;
			walk(value, null, {
				CallExpression(node, context) {
					should_be_declared = true;
					context.stop();
				},
				MemberExpression(node, context) {
					should_be_declared = true;
					context.stop();
				}
			});
			if (should_be_declared) {
				const value_name = context.state.scope.generate('$$initial');
				initial_declarations.set(value_name, value);
				value = b.id(value_name);
			}
		}
		/** @type {ReactiveProperty} */
		const source = [
			name,
			rune,
			call,
			value,
			(value.type === 'Identifier' && initial_declarations.has(value.name)) || references_this
		];
		sources.set(property, source);
		if (references_this) {
			declarations.push(name);
		} else if (source[4]) {
			before.push(b.let(name, value));
		} else {
			before.push(b.let(name, b.call(call, value)));
		}
	}
	if (declarations.length) {
		before.push(
			b.declaration(
				'let',
				declarations.map((name) => b.declarator(name))
			)
		);
	}
	for (let [name, value] of initial_declarations) {
		after.push(b.let(name, value));
	}
	/** @type {(Property | SpreadElement)[]} */
	const properties = [];
	for (let property of node.properties) {
		if (property.type === 'SpreadElement') {
			properties.push(/** @type {SpreadElement} */ (context.visit(property)));
			continue;
		}
		if (sources.has(property)) {
			const [name, rune, call, value, initially_declared] = /** @type {ReactiveProperty} */ (
				sources.get(property)
			);
			let maybe_assign = initially_declared
				? b.assignment('??=', b.id(name), b.call(call, value))
				: b.id(name);
			properties.push(
				b.prop(
					'get',
					/** @type {Expression} */ (context.visit(/**@type {Expression} */ (property.key))),
					b.function(null, [], b.block([b.return(b.call('$.get', maybe_assign))])),
					property.computed
				),
				b.prop(
					'set',
					/** @type {Expression} */ (context.visit(property.key)),
					b.function(
						null,
						[b.id('$$value')],
						b.block([
							b.stmt(
								b.call(
									'$.set',
									maybe_assign,
									b.id('$$value'),
									rune === '$state' ? b.true : undefined
								)
							)
						])
					),
					property.computed
				)
			);
		} else {
			properties.push(/** @type {Property} */ (context.visit(property)));
		}
	}
	if (has_this_reference) {
		body.push(...before);
		body.push(b.let('$$object', b.object(properties)));
		body.push(...after);
		body.push(b.return(b.id('$$object')));
	} else {
		body.push(...before, ...after);
		body.push(b.return(b.object(properties)));
	}
	return b.call(b.arrow([], b.block(body)));
}
