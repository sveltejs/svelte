/** @import { ObjectExpression, Property, CallExpression, Expression, SpreadElement } from 'estree' */
/** @import { Context } from '../types' */
import * as b from '../../../../utils/builders.js';
import { get_rune } from '../../../scope.js';
import { should_proxy } from '../utils.js';

/**
 * @param {ObjectExpression} node
 * @param {Context} context
 */
export function ObjectExpression(node, context) {
	let has_runes = false;
	/**
	 * @type {Array<{rune: NonNullable<ReturnType<typeof get_rune>>, property: Property & {value: CallExpression}}>}
	 */
	let reactive_properties = [];
	for (let property of node.properties) {
		if (property.type !== 'Property') continue;
		const rune = get_rune(property.value, context.state.scope);
		if (rune) {
			has_runes = true;
			reactive_properties.push({
				rune,
				property: /**@type {Property & {value: CallExpression}} */ (property)
			});
		}
	}
	if (!has_runes) return;
	let body = [];
	let sources = new Map();
	let counter = 0;
	for (let { rune, property } of reactive_properties) {
		const name = context.state.scope.generate(`$$${++counter}`);
		const deep = rune !== '$state.raw';
		const call = rune.match(/^\$state/) ? '$.state' : '$.derived';
		/** @type {Expression} */
		let value = /** @type {Expression} */ (context.visit(property.value.arguments[0] ?? b.void0));
		value =
			rune === '$derived'
				? b.thunk(value)
				: rune !== '$derived.by' && deep && should_proxy(value, context.state.scope)
					? b.call('$.proxy', value)
					: value;
		sources.set(property, [deep, name]);
		body.push(b.let(name, b.call(call, value)));
	}
	/** @type {(Property | SpreadElement)[]} */
	let properties = [];
	for (let property of node.properties) {
		if (property.type === 'SpreadElement') {
			properties.push(/** @type {SpreadElement} */ (context.visit(property)));
			continue;
		}
		if (sources.has(property)) {
			let [deep, name] = sources.get(property);
			properties.push(
				b.prop(
					'get',
					/** @type {Expression} */ (context.visit(/**@type {Expression} */ (property.key))),
					b.function(null, [], b.block([b.return(b.call('$.get', b.id(name)))])),
					property.computed
				),
				b.prop(
					'set',
					/** @type {Expression} */ (context.visit(property.key)),
					b.function(
						null,
						[b.id('$$value')],
						b.block([
							b.stmt(b.call('$.set', b.id(name), b.id('$$value'), deep ? b.true : undefined))
						])
					),
					property.computed
				)
			);
		} else {
			properties.push(/** @type {Property} */ (context.visit(property)));
		}
	}
	body.push(b.return(b.object(properties)));
	return b.call(b.arrow([], b.block(body)));
}
