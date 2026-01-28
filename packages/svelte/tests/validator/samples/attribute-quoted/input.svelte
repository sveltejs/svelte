<svelte:options runes />

<!-- don't warn on these -->

<!-- prettier-ignore -->
<p class="{foo}"></p>
<!-- prettier-ignore -->
<svelte:element this={foo} class="{foo}"></svelte:element>

<!-- warn on these -->

<!-- prettier-ignore -->
<Component class="{foo}" />
<!-- prettier-ignore -->
<svelte:component this={foo} class="{foo}" />
<!-- prettier-ignore -->
{#if foo}
	<!-- svelte-ignore svelte_self_deprecated -->
	<svelte:self class="{foo}" />
{/if}
<!-- prettier-ignore -->
<custom-element class="{foo}"></custom-element>
