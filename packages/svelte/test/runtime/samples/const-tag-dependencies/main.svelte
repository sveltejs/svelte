<script>
	export let value = 4;
	export let a = 3;
	export let b = 4;
</script>

{#each [value] as n}
  {@const ab = a + b}
	<div>{ab}</div>
{/each}