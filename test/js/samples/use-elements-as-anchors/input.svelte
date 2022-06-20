<script>
	export let a;
	export let b;
	export let c;
	export let d;
	export let e;
</script>

<div>
	{#if a}
		<p>a</p>
	{/if}

	<p>this can be used as an anchor</p>

	{#if b}
		<p>b</p>
	{/if}

	{#if c}
		<p>c</p>
	{/if}

	<p>so can this</p>

	{#if d}
		<p>d</p>
	{/if}

	<!-- d can use 'null' as its anchor -->
</div>

{#if e}
	<p>e</p>
{/if}