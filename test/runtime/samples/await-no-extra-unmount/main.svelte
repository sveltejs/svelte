<script>
	import Component from "./Component.svelte";
	let mounts = 0;
	let promise = Promise.resolve();

	(async () => {
		await Promise.resolve();
		promise = Promise.resolve();
	})();
</script>

{#await promise then _}
	<Component bind:mounts />
{/await}
