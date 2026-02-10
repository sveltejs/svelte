<script lang="ts">
	import Child from "./Child.svelte";

	await 1;
	let b = true;
	let a = true;
</script>

{#if a}
	<div>
		{#if b}
			<p>hello</p>
		{/if}
	</div>
	<div>
		<Child {b} />
	</div>
{/if}
