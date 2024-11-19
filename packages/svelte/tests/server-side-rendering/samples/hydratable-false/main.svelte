<script lang="ts">
import Component from "./Component.svelte";
</script>


{#if true}
	if
{/if}

{#each [] as i}
	{i}
{/each}

{#await Promise.resolve(10) then x}
	{x}
{/await}

{#await new Promise((res)=>setTimeout(res,1000,1000)) then x}
	{x}
	{#await Promise.resolve("nested") then value}
		{value}
	{/await}

	{#await Promise.resolve("nested multiple") then value}
		{value}
	{/await}

	{#await Promise.resolve("multiple nested") then value}
		{value}
		{#await Promise.resolve("nested nested") then value}
			{value}
		{/await}
	{/await}
{/await}

{#key true}
	cool
{/key}

{#snippet to_render()}
	cool
{/snippet}

{@render to_render()}

<Component />