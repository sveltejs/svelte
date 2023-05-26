<script>
	export let name = "world";
	export let array = [];
</script>

<h1>Hello, {name}</h1>
{#each array as elem}
	<p>
	item
	</p>
{:else}
	<p>
	weird
	</p>
{/each}
