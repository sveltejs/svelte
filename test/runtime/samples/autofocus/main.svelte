<script>
	let autofocus = true;
	let active = "text";
</script>

<input title="input" bind:value={active} />

{#if active === "text"}
	<input title={active} autofocus />
{:else if active === "dynamic"}
	<input title={active} {autofocus} />
{:else if active === "bound"}
	<input title={active} autofocus={autofocus} />
{:else if active === "fn"}
	<input title={active} autofocus={() => true} />
{/if}
