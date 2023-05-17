<script>
	import Foo from './Foo.svelte';

	export let visible = true;
	export let answer = 42;
</script>

{#if visible}
	<Foo bind:answer/>
{:else}
	<Foo bind:answer/>
{/if}
