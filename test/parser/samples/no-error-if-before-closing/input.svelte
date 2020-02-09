{#if true}
	<input>
{:else}
{/if}

{#if true}
	<br>
{:else}
{/if}

{#await true}
	<input>
{:then f}
{/await}

{#await true}
	<br>
{:then f}
{/await}