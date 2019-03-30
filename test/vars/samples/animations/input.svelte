<script>
	import hoistable_foo from '';
	let foo;
</script>

{#each [] as x (x)}
	<div animate:hoistable_foo/>
{/each}
{#each [] as x (x)}
	<div animate:foo/>
{/each}
