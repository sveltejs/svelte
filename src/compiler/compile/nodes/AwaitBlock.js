import Node from './shared/Node.js';
import PendingBlock from './PendingBlock.js';
import ThenBlock from './ThenBlock.js';
import CatchBlock from './CatchBlock.js';
import Expression from './shared/Expression.js';
import { unpack_destructuring } from './shared/Context.js';

/** @extends Node<'AwaitBlock'> */
export default class AwaitBlock extends Node {
	/** @type {import('./shared/Expression.js').default} */
	expression;

	/** @type {import('./shared/Context.js').Context[]} */
	then_contexts;

	/** @type {import('./shared/Context.js').Context[]} */
	catch_contexts;

	/** @type {import('estree').Node | null} */
	then_node;

	/** @type {import('estree').Node | null} */
	catch_node;

	/** @type {import('./PendingBlock.js').default} */
	pending;

	/** @type {import('./ThenBlock.js').default} */
	then;

	/** @type {import('./CatchBlock.js').default} */
	catch;

	/** @type {Map<string, import('estree').Node>} */
	context_rest_properties = new Map();

	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('./shared/Node.js').default} parent
	 * @param {import('./shared/TemplateScope.js').default} scope
	 * @param {import('../../interfaces.js').TemplateNode} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.cannot_use_innerhtml();
		this.not_static_content();
		this.expression = new Expression(component, this, scope, info.expression);
		this.then_node = info.value;
		this.catch_node = info.error;
		if (this.then_node) {
			this.then_contexts = [];
			unpack_destructuring({
				contexts: this.then_contexts,
				node: info.value,
				scope,
				component,
				context_rest_properties: this.context_rest_properties
			});
		}
		if (this.catch_node) {
			this.catch_contexts = [];
			unpack_destructuring({
				contexts: this.catch_contexts,
				node: info.error,
				scope,
				component,
				context_rest_properties: this.context_rest_properties
			});
		}
		this.pending = new PendingBlock(component, this, scope, info.pending);
		this.then = new ThenBlock(component, this, scope, info.then);
		this.catch = new CatchBlock(component, this, scope, info.catch);
	}
}
