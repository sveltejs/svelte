<script>
	import A from './A.svelte';

	let object = $state();

	function open() {
		object = { boolean: true };
	}

	function close() {
		object = undefined;
	}

	let closed = $state(false);
</script>

<button onclick={open}>
	open
</button>

<button onclick={() => closed = true}>
	close
</button>

<hr>

{#if object}
	<A {close} {closed} boolean={object.boolean} />
{/if}
