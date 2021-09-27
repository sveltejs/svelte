import { TemplateNode, ConstTag as ConstTagType } from '../../../interfaces';
import Component from '../../Component';
import ConstTag from '../ConstTag';
import map_children from './map_children';
import { INodeAllowConstTag, INode } from '../interfaces';
import check_graph_for_cycles from '../../utils/check_graph_for_cycles';
import compiler_errors from '../../compiler_errors';

export default function get_const_tags(children: TemplateNode[], component: Component, node: INodeAllowConstTag, parent: INode): [ConstTag[], Array<Exclude<INode, ConstTag>>] {
  const const_tags: ConstTagType[] = [];
  const others: Array<Exclude<TemplateNode, ConstTagType>> = [];

  for (const child of children) {
    if (child.type === 'ConstTag') {
      const_tags.push(child as ConstTagType);
    } else {
      others.push(child);
    }
  }

  const consts_nodes = const_tags.map(tag => new ConstTag(component, node, node.scope, tag));
  const sorted_consts_nodes = sort_consts_nodes(consts_nodes, component);
  sorted_consts_nodes.forEach(node => node.parse_expression());

  const children_nodes = map_children(component, parent, node.scope, others);

  return [sorted_consts_nodes, children_nodes as Array<Exclude<INode, ConstTag>>];
}

function sort_consts_nodes(consts_nodes: ConstTag[], component: Component) {
  type ConstNode = {
    assignees: Set<string>;
    dependencies: Set<string>;
    node: ConstTag;
  };
  const sorted_consts_nodes: ConstNode[] = [];

  const unsorted_consts_nodes: ConstNode[] = consts_nodes.map(node => {
    return {
      assignees: node.assignees,
      dependencies: node.dependencies,
      node
    };
  });

  const lookup = new Map();

  unsorted_consts_nodes.forEach(node => {
    node.assignees.forEach(name => {
      if (!lookup.has(name)) {
        lookup.set(name, []);
      }
      lookup.get(name).push(node);
    });
  });

  const cycle = check_graph_for_cycles(unsorted_consts_nodes.reduce((acc, node) => {
    node.assignees.forEach(v => {
      node.dependencies.forEach(w => {
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

  const add_node = (node: ConstNode) => {
    if (sorted_consts_nodes.includes(node)) return;

    node.dependencies.forEach(name => {
      if (node.assignees.has(name)) return;
      const earlier_nodes = lookup.get(name);
      if (earlier_nodes) {
        earlier_nodes.forEach(add_node);
      }
    });

    sorted_consts_nodes.push(node);
  };

  unsorted_consts_nodes.forEach(add_node);

  return sorted_consts_nodes.map(node => node.node);
}
