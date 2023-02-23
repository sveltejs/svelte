<script>
	import A from "./A.svelte";
	let a;
	export let show_default = true;
	export let show_a = true;
	export let show_b = false;

	export function getData() {
		return a.getData();
	}
</script>

<A bind:this={a}>
	{#if show_a}
		<svelte:fragment slot="a">
			<span>hello a</span>
		</svelte:fragment>
	{/if}
	{#if show_default}
		<svelte:fragment slot="default">
			<span>bye</span>
			<span>default</span>
		</svelte:fragment>
	{/if}
	{#if show_b}
		<svelte:fragment slot="b">
			<span>hello b</span>
		</svelte:fragment>
	{/if}
</A>
