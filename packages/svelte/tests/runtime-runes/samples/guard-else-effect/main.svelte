<script lang="ts">
	let b = $state(false);
	let v = $state("two");

	$effect(() => {
		v = b ? "one" : "two";
	})
</script>

<button onclick={() => b = !b}>Trigger</button>

{#if v === "one"}
	<div>if1 matched! {console.log('one')}</div>
{:else if v === "two"}
	<div>if2 matched! {console.log('two')}</div>
{:else}
	<div>nothing matched {console.log('else')}</div>
{/if}
