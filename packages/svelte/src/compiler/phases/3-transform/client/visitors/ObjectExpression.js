/** @import { ObjectExpression, Property, CallExpression, Expression, SpreadElement, Statement } from 'estree' */
/** @import { Context } from '../types' */
import * as b from '../../../../utils/builders.js';
import { get_rune } from '../../../scope.js';
import { should_proxy } from '../utils.js';

/**
 * @param {ObjectExpression} node
 * @param {Context} context
 */
export function ObjectExpression(node, context) {
	/**
	 * @typedef {[string, NonNullable<ReturnType<typeof get_rune>>]} ReactiveProperty
	 */
	let has_runes = false;
	const valid_property_runes = ['$state', '$derived', '$state.raw', '$derived.by'];
	/** @type {Statement[]} */
	const body = [];
	/** @type {Map<Property, ReactiveProperty>} */
	const sources = new Map();
	let counter = 0;
	for (let property of node.properties) {
		if (property.type !== 'Property') continue;
		const rune = get_rune(property.value, context.state.scope);
		if (rune && valid_property_runes.includes(rune)) {
			has_runes = true;
			const name = context.state.scope.generate(`$$${++counter}`);
			const call = rune.match(/^\$state/) ? '$.state' : '$.derived';
			/** @type {Expression} */
			let value = /** @type {Expression} */ (
				context.visit(/** @type {CallExpression} */ (property.value).arguments[0] ?? b.void0)
			);
			value =
				rune === '$derived'
					? b.thunk(value)
					: rune === '$state' && should_proxy(value, context.state.scope)
						? b.call('$.proxy', value)
						: value;
			/** @type {ReactiveProperty} */
			const source = [name, rune];
			sources.set(property, source);
			body.push(b.let(name, b.call(call, value)));
		}
	}
	if (!has_runes) {
		context.next();
		return;
	}
	/** @type {(Property | SpreadElement)[]} */
	const properties = [];
	for (let property of node.properties) {
		if (property.type === 'SpreadElement') {
			properties.push(/** @type {SpreadElement} */ (context.visit(property)));
			continue;
		}
		if (sources.has(property)) {
			const [name, rune] = /** @type {ReactiveProperty} */ (sources.get(property));
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
							b.stmt(
								b.call('$.set', b.id(name), b.id('$$value'), rune === '$state' ? b.true : undefined)
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
	body.push(b.return(b.object(properties)));
	return b.call(b.arrow([], b.block(body)));
}
