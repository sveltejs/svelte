import { onMount } from 'svelte';
import Tooltip from './Tooltip.svelte';

export function setup() {
	onMount(() => {
		let tooltip;
		let timeout;

		function over(event) {
			if (event.target.tagName === 'DATA-LSP') {
				clearTimeout(timeout);

				if (!tooltip) {
					tooltip = new Tooltip({
						target: document.body
					});

					tooltip.$on('mouseenter', () => {
						clearTimeout(timeout);
					});

					tooltip.$on('mouseleave', () => {
						clearTimeout(timeout);
						tooltip.$destroy();
						tooltip = null;
					});
				}

				const rect = event.target.getBoundingClientRect();
				const html = event.target.getAttribute('lsp');

				const x = (rect.left + rect.right) / 2 + window.scrollX;
				const y = rect.top + window.scrollY;

				tooltip.$set({
					html,
					x,
					y
				});
			}
		}

		function out(event) {
			if (event.target.tagName === 'DATA-LSP') {
				timeout = setTimeout(() => {
					tooltip.$destroy();
					tooltip = null;
				}, 200);
			}
		}

		window.addEventListener('mouseover', over);
		window.addEventListener('mouseout', out);

		return () => {
			window.removeEventListener('mouseover', over);
			window.removeEventListener('mouseout', out);
		};
	});
}
