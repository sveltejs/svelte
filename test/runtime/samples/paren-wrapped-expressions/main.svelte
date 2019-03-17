<script>
	export let a;
	export let b;
	export let c;
</script>

<span>{ (a) }</span>
<span class='{ (a) }'></span>
{#if (b) }
	<span>true</span>
{/if}
{#each (c) as x}
	<span>{x}</span>
{/each}
