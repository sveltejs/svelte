<script>
	import A from './A.svelte';
	import Child, { open } from './Child.svelte';

	let closed = $state(false);
</script>

<button onclick={open}>
	open
</button>

<button onclick={() => closed = true}>
	close
</button>

<hr>

<Child>
	{#snippet children(boolean)}
		<A {closed} {boolean} />
	{/snippet}
</Child>

