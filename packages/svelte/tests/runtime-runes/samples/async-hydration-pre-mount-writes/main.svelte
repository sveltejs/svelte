<script module>
	import RootLayout from './RootLayout.svelte';
	import AsyncLayout from './AsyncLayout.svelte';
	import DataLayout from './DataLayout.svelte';
	import Page from './Page.svelte';
	import { RenderNode } from './state.svelte.js';

	function onerror(error) {
		throw error;
	}

	const root_data = { root: 'root' };
	const async_data = { root: 'root' };
	const data_layout_data = { root: 'root', child: 'child' };
	const page_data = { root: 'root', child: 'child' };

	/**
	 * Builds a plain, non-reactive tree with the same shape as the one produced
	 * by `create_tree`. Used for SSR, where no class writes should happen.
	 */
	function create_server_tree() {
		return {
			component: RootLayout,
			error: undefined,
			data: root_data,
			child: {
				component: AsyncLayout,
				error: undefined,
				data: async_data,
				child: {
					component: DataLayout,
					error: undefined,
					data: data_layout_data,
					child: {
						component: Page,
						error: undefined,
						data: page_data,
						child: undefined
					}
				}
			}
		};
	}

	/**
	 * Builds the reactive tree. The `data` and `child` writes happen here, i.e.
	 * before hydration starts, rather than during component initialization.
	 */
	export function create_tree() {
		const root = new RenderNode(RootLayout);
		const async_layout = new RenderNode(AsyncLayout);
		const data_layout = new RenderNode(DataLayout);
		const page = new RenderNode(Page);

		root.data = root_data;
		root.child = async_layout;

		async_layout.data = async_data;
		async_layout.child = data_layout;

		data_layout.data = data_layout_data;
		data_layout.child = page;

		page.data = page_data;

		return root;
	}
</script>

<script>
	let { tree = create_server_tree() } = $props();
</script>

{#snippet node(n, depth)}
	{const Component = $derived(n.component)}
	{const Error = $derived(n.error)}
	{const data = $derived(n.data)}

	{#snippet failed(error)}
		<Error {error} />
	{/snippet}

	<svelte:boundary onerror={Error ? onerror : undefined} failed={Error ? failed : undefined}>
		{#if n.child}
			<Component {data}>
				{@render node(n.child, depth + 1)}
			</Component>
		{:else}
			<Component {data} />
		{/if}
	</svelte:boundary>
{/snippet}

{@render node(tree, 0)}
