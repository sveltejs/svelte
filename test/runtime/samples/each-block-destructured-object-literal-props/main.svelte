<script>
	export let objectsArray;
</script>

{#each objectsArray as { 0: prop0, "foo-bar": propFooBar, prop: varProp } }
	<p>{propFooBar}: {varProp} {prop0}</p>
{/each}
