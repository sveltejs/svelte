import { quintOut } from 'svelte/easing';

export default function crossfade({ send, receive, fallback }) {
	let requested = new Map();
	let provided = new Map();

	function crossfade(from, node) {
		const to = node.getBoundingClientRect();
		const dx = from.left - to.left;
		const dy = from.top - to.top;

		const style = getComputedStyle(node);
		const transform = style.transform === 'none' ? '' : style.transform;

		return {
			duration: 400,
			easing: quintOut,
			css: (t, u) => `
				opacity: ${t};
				transform: ${transform} translate(${u * dx}px,${u * dy}px);
			`
		};
	}

	return {
		send(node, params) {
			provided.set(params.key, {
				rect: node.getBoundingClientRect()
			});

			return () => {
				if (requested.has(params.key)) {
					const { rect } = requested.get(params.key);
					requested.delete(params.key);

					return crossfade(rect, node);
				}

				// if the node is disappearing altogether
				// (i.e. wasn't claimed by the other list)
				// then we need to supply an outro
				provided.delete(params.key);
				return fallback(node, params);
			};
		},

		receive(node, params) {
			requested.set(params.key, {
				rect: node.getBoundingClientRect()
			});

			return () => {
				if (provided.has(params.key)) {
					const { rect } = provided.get(params.key);
					provided.delete(params.key);

					return crossfade(rect, node);
				}

				requested.delete(params.key);
				return fallback(node, params);
			};
		}
	};
}