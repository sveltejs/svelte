import ConstTag from '../ConstTag.js';
import map_children from './map_children.js';
import check_graph_for_cycles from '../../utils/check_graph_for_cycles.js';
import compiler_errors from '../../compiler_errors.js';

/**
 * @param {import('../../../interfaces.js').TemplateNode[]} children
 * @param {import('../../Component.js').default} component
 * @param {import('../interfaces.js').INodeAllowConstTag} node
 * @param {import('../interfaces.js').INode} parent
 * @returns {[import('../../../interfaces.js').ConstTag[], never[]]}
 */
export default function get_const_tags(children, component, node, parent) {

    /** @type {ConstTagType[]} */
    const const_tags = [];

    /** @type {Array<Exclude<import('../../../interfaces.js').TemplateNode, ConstTagType>>} */
    const others = [];
    for (const child of children) {
        if (child.type === 'ConstTag') {
            const_tags.push(/** @type {ConstTagType} */ (child));
        }
        else {
            others.push(child);
        }
    }
    const consts_nodes = const_tags.map(/** @param {any} tag */ (tag) => new ConstTag(component, node, node.scope, tag));
    const sorted_consts_nodes = sort_consts_nodes(consts_nodes, component);
    sorted_consts_nodes.forEach(/** @param {any} node */ (node) => node.parse_expression());
    const children_nodes = map_children(component, parent, node.scope, others);
    return [sorted_consts_nodes, /** @type {Array<Exclude<import('../interfaces.js').INode, import('../../../interfaces.js').ConstTag>>} */ (children_nodes)];
}

/**
 * @param {import('../../../interfaces.js').ConstTag[]} consts_nodes
 * @param {import('../../Component.js').default} component
 */
function sort_consts_nodes(consts_nodes, component) {

    /** @type {ConstNode[]} */
    const sorted_consts_nodes = [];

    /** @type {ConstNode[]} */
    const unsorted_consts_nodes = consts_nodes.map(/** @param {any} node */ (node) => {
        return {
            assignees: node.assignees,
            dependencies: node.dependencies,
            node
        };
    });
    const lookup = new Map();
    unsorted_consts_nodes.forEach(/** @param {any} node */ (node) => {
        node.assignees.forEach(/** @param {any} name */ (name) => {
            if (!lookup.has(name)) {
                lookup.set(name, []);
            }
            lookup.get(name).push(node);
        });
    });
    const cycle = check_graph_for_cycles(unsorted_consts_nodes.reduce(/**
 * @param {any} acc
     * @param {any} node
     */ (acc, node) => {
        node.assignees.forEach(/** @param {any} v */ (v) => {
            node.dependencies.forEach(/** @param {any} w */ (w) => {
                if (!node.assignees.has(w)) {
                    acc.push([v, w]);
                }
            });
        });
        return acc;
    }, []));
    if (cycle && cycle.length) {
        const nodeList = lookup.get(cycle[0]);
        const node = nodeList[0];
        component.error(node.node, compiler_errors.cyclical_const_tags(cycle));
    }

    /** @param {ConstNode} node */
    const add_node = (node) => {
        if (sorted_consts_nodes.includes(node))
            return;
        node.dependencies.forEach(/** @param {any} name */ (name) => {
            if (node.assignees.has(name))
                return;
            const earlier_nodes = lookup.get(name);
            if (earlier_nodes) {
                earlier_nodes.forEach(add_node);
            }
        });
        sorted_consts_nodes.push(node);
    };
    unsorted_consts_nodes.forEach(add_node);
    return sorted_consts_nodes.map(/** @param {any} node */ (node) => node.node);
}




