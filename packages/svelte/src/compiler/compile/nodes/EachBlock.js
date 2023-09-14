import ElseBlock from './ElseBlock.js';
import Expression from './shared/Expression.js';
import AbstractBlock from './shared/AbstractBlock.js';
import { unpack_destructuring } from './shared/Context.js';
import compiler_errors from '../compiler_errors.js';
import get_const_tags from './shared/get_const_tags.js';

/** @extends AbstractBlock<'EachBlock'> */
export default class EachBlock extends AbstractBlock {
	/** @type {import('./shared/Expression.js').default} */
	expression;

	/** @type {import('estree').Node} */
	context_node;

	/** @type {string} */
	iterations;

	/** @type {string} */
	index;

	/** @type {string} */
	context;

	/** @type {import('./shared/Expression.js').default} */
	key;

	/** @type {import('./shared/TemplateScope.js').default} */
	scope;

	/** @type {import('./shared/Context.js').Context[]} */
	contexts;

	/** @type {import('./ConstTag.js').default[]} */
	const_tags;

	/** @type {boolean} */
	has_animation;
	/** */
	has_binding = false;
	/** */
	has_index_binding = false;

	/** @type {Map<string, import('estree').Node>} */
	context_rest_properties;

	/** @type {import('./ElseBlock.js').default} */
	else;

	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('estree').Node} parent
	 * @param {import('./shared/TemplateScope.js').default} scope
	 * @param {import('../../interfaces.js').TemplateNode} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.cannot_use_innerhtml();
		this.not_static_content();
		this.expression = new Expression(component, this, scope, info.expression);
		this.context = info.context.name || 'each'; // TODO this is used to facilitate binding; currently fails with destructuring
		this.context_node = info.context;
		this.index = info.index;
		this.scope = scope.child();
		this.context_rest_properties = new Map();
		this.contexts = [];
		unpack_destructuring({
			contexts: this.contexts,
			node: info.context,
			scope,
			component,
			context_rest_properties: this.context_rest_properties
		});
		this.contexts.forEach((context) => {
			if (context.type !== 'DestructuredVariable') return;
			this.scope.add(context.key.name, this.expression.dependencies, this);
		});
		if (this.index) {
			// index can only change if this is a keyed each block
			const dependencies = info.key ? this.expression.dependencies : new Set([]);
			this.scope.add(this.index, dependencies, this);
		}
		this.key = info.key ? new Expression(component, this, this.scope, info.key) : null;
		this.has_animation = false;
		[this.const_tags, this.children] = get_const_tags(info.children, component, this, this);
		if (this.has_animation) {
			this.children = this.children.filter(
				(child) => !is_empty_node(child) && !is_comment_node(child)
			);
			if (this.children.length !== 1) {
				const child = this.children.find(
					(child) => !!(/** @type {import('./Element.js').default} */ (child).animation)
				);
				component.error(
					/** @type {import('./Element.js').default} */ (child).animation,
					compiler_errors.invalid_animation_sole
				);
				return;
			}
		}
		this.warn_if_empty_block();
		this.else = info.else ? new ElseBlock(component, this, this.scope, info.else) : null;
	}
}

/** @param {import('./interfaces.js').INode} node */
function is_empty_node(node) {
	return node.type === 'Text' && node.data.trim() === '';
}

/** @param {import('./interfaces.js').INode} node */
function is_comment_node(node) {
	return node.type === 'Comment';
}
