import { TemplateNode } from '../interfaces';
import { flatten } from './flatten';
import { regex_whitespace } from './patterns';
import { INode } from '../compile/nodes/interfaces';

const regex_svelte_ignore = /^\s*svelte-ignore\s+([\s\S]+)\s*$/m;

export function extract_svelte_ignore(text: string): string[] {
	const match = regex_svelte_ignore.exec(text);
	return match ? match[1].split(regex_whitespace).map(x => x.trim()).filter(Boolean) : [];
}

export function extract_svelte_ignore_from_comments<Node extends { leadingComments?: Array<{value: string}> }>(node: Node): string[] {
	return flatten((node.leadingComments || []).map(comment => extract_svelte_ignore(comment.value)));
}

export function extract_ignores_above_position(position: number, template_nodes: TemplateNode[]): string[] {
	const previous_node_idx = template_nodes.findIndex(child => child.end === position);
	if (previous_node_idx === -1) {
		return [];
	}

	for (let i = previous_node_idx; i >= 0; i--) {
		const node = template_nodes[i];
		if (node.type !== 'Comment' && node.type !== 'Text') {
			return [];
		}
		if (node.type === 'Comment') {
			if (node.ignores.length) {
				return node.ignores;
			}
		}
	}

	return [];
}

export function extract_ignores_above_node(node: INode): string[] {
  /**
    * This utilizes the fact that node has a prev and a next attribute
    * which means that it can find svelte-ignores along
    * the nodes on the same level as itself who share the same parent. 
    */
  let cur_node = node.prev;
  while (cur_node) {
    if (cur_node.type !== 'Comment' && cur_node.type !== 'Text') {
      return [];
	  }

	  if (cur_node.type === 'Comment' && cur_node.ignores.length) {
      return cur_node.ignores;
	  }

    cur_node = cur_node.prev;
  }

  return [];
}
