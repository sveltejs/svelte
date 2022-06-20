export default function check_graph_for_cycles(edges: Array<[any, any]>): any[] {
	const graph: Map<any, any[]> = edges.reduce((g, edge) => {
		const [u, v] = edge;
		if (!g.has(u)) g.set(u, []);
		if (!g.has(v)) g.set(v, []);
		g.get(u).push(v);
		return g;
	}, new Map());

	const visited = new Set();
	const on_stack = new Set();
	const cycles = [];

	function visit (v) {
		visited.add(v);
		on_stack.add(v);

		graph.get(v).forEach(w => {
			if (!visited.has(w)) {
				visit(w);
			} else if (on_stack.has(w)) {
				cycles.push([...on_stack, w]);
			}
		});

		on_stack.delete(v);
	}

	graph.forEach((_, v) => {
		if (!visited.has(v)) {
			visit(v);
		}
	});

	return cycles[0];
}
