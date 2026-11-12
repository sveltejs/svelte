<script module>
	import Holder from './Holder.svelte';
	import Child from './Child.svelte';

	export { Holder };

	class RenderNode {
		data = $state.raw({});
		child = $state.raw();
	}

	export let tree = { child: { text: 'ready' } };

	export function prepare() {
		tree = new RenderNode();
		return () => {
			tree.data = { value: 'updated' };
			tree.child = { text: 'ready' };
		};
	}
</script>

<svelte:boundary>
	{#snippet pending()}loading{/snippet}
	<Child text={tree.child.text} />
</svelte:boundary>
