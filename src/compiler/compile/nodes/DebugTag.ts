import Node from './shared/Node.js';
import Expression from './shared/Expression.js';

/** @extends Node */
export default class DebugTag extends Node {

    /** @type {'DebugTag'} */
    type;

    /** @type {import('./shared/Expression.js').default[]} */
    expressions;

 /**
  * @param {import('../Component.js').default} component  *
     * @param {import('./interfaces.js').INode} parent  *
     * @param {import('./shared/TemplateScope.js').default} scope  *
     * @param {import('../../interfaces.js').TemplateNode} info  undefined
     */
    constructor(component, parent, scope, info) {
        super(component, parent, scope, info);
        this.expressions = info.identifiers.map(/** @param {EsTreeNode} node */ (node) => {
            return new Expression(component, parent, scope, node);
        });
    }
}




