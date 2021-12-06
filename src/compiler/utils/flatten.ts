export function flatten<T>(nodes: T[][], target?: T[]): T[];
export function flatten<T>(nodes: T[], target?: T[]): T[];
export function flatten(nodes: any[], target: any[] = []): any[] {
	for (let i = 0; i < nodes.length; i += 1) {
		const node = nodes[i];
		if (Array.isArray(node)) {
			flatten(node, target);
		} else {
			target.push(node);
		}
	}

	return target;
}
