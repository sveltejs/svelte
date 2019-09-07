export default function checkGraphForCycles(edges: Array<[any, any]>): any[] {
	const graph: Map<any, any[]> = edges.reduce((g, edge) => {
		const [u, v] = edge;
		if (!g.has(u)) g.set(u, []);
		if (!g.has(v)) g.set(v, []);
		g.get(u).push(v);
		return g;
	}, new Map());

	const visited = new Set();
	const onStack = new Set();
	const cycles = [];

	function visit (v) {
		visited.add(v);
		onStack.add(v);

		graph.get(v).forEach(w => {
			if (!visited.has(w)) {
				visit(w);
			} else if (onStack.has(w)) {
				cycles.push([...onStack, w]);
			}
		});

		onStack.delete(v);
	}

	graph.forEach((_, v) => {
		if (!visited.has(v)) {
			visit(v);
		}
	});

	return cycles[0];
}
