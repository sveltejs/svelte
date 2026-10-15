<script module>
	import Layout from './Layout.svelte';
	import DataLayout from './DataLayout.svelte';
	import Page from './Page.svelte';

	class RenderNode {
		data = $state.raw({});
		child = $state.raw();
		constructor(component) {
			this.component = component;
		}
	}

	export let tree = {
		component: Layout,
		data: { root: 'root' },
		child: {
			component: DataLayout,
			data: { root: 'root', child: 'child' },
			child: { component: Page, data: {} }
		}
	};

	export function prepare() {
		tree = new RenderNode(Layout);
		const child = new RenderNode(DataLayout);
		child.data = { root: 'root', child: 'child' };
		child.child = new RenderNode(Page);
		return () => {
			tree.data = { root: 'root' };
			tree.child = child;
		};
	}
</script>

{#snippet node(n)}
	{const Component = $derived(n.component)}
	{const Error = $derived(n.error)}
	{const data = $derived(n.data)}

	{#snippet failed(error)}
		<Error {error} />
	{/snippet}

	<svelte:boundary failed={Error ? failed : undefined}>
		{#if n.child}
			<Component {data}>
				{@render node(n.child)}
			</Component>
		{:else}
			<Component {data} />
		{/if}
	</svelte:boundary>
{/snippet}

{@render node(tree)}
<!-- Both pending boundaries must restore their shared hydration batch independently. -->
{@render node(tree)}
