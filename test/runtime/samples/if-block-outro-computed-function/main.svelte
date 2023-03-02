<script>
	import Foo from './Foo.svelte'
  export let foo = true
	$: bar = () => true
</script>

{#if foo}
	<Foo />
{:else if bar()}
	bar
{:else}
	else
{/if}
