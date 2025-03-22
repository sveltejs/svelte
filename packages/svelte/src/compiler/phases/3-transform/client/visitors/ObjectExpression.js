/** @import { ObjectExpression, Property, CallExpression, Expression, SpreadElement } from 'estree' */
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
	if (!has_runes) {
		context.next();
		return;
	}
	let body = [];
	let sources = new Map();
	let has_this_reference = false;
	let counter = 0;
	let to_push = [];
	for (let { rune, property } of reactive_properties) {
		const name = context.state.scope.generate(`$$${++counter}`);
		const call = rune.match(/^\$state/) ? '$.state' : '$.derived';
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
		sources.set(property, [name, rune]);
		to_push.push(b.let(name, b.call(call, value)));
	}
	/** @type {(Property | SpreadElement)[]} */
	let properties = [];
	for (let property of node.properties) {
		if (property.type === 'SpreadElement') {
			properties.push(/** @type {SpreadElement} */ (context.visit(property)));
			continue;
		}
		if (sources.has(property)) {
			let [name, rune] = sources.get(property);
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
	if (has_this_reference) {
		body.push(b.let('$$object', b.object(properties)));
		body.push(...to_push);
		body.push(b.return(b.id('$$object')));
	} else {
		body.push(...to_push);
		body.push(b.return(b.object(properties)));
	}
	return b.call(b.arrow([], b.block(body)));
}
