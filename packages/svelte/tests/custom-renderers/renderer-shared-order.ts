import { connections, type ObjFragment } from './renderer.js';

export function shared_connection<Node, Container>(
	container: Container,
	keys: string,
	create_marker: (key: string) => Node
) {
	let index = 0;

	return () => {
		if (index === keys.length) throw new Error('Unexpected extra renderer connection');
		const node = create_marker(keys[index++]);
		connections.open += 1;
		return { node, container, destroy: () => void (connections.open -= 1) };
	};
}

export function marker_order(target: ObjFragment) {
	return target.children
		.map((node) => (node.type === 'element' ? node.attributes['data-key'] ?? '' : ''))
		.join('');
}
