<script lang="ts">
	import Component from "./Component.svelte";
</script>


{#if true}
	if
{/if}

{#each [] as i}
	{i}
{/each}

{#await Promise.resolve() then x}
	{x}
{/await}

{#key true}
	cool
{/key}

{#snippet to_render()}
	cool
{/snippet}

{@render to_render()}

<Component />