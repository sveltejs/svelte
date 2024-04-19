<!-- valid - foreign namespace -->
<svg><g /></svg>

<!-- not reported - void tags -->
<link />
<br/>
<svelte:options />
<svelte:window on:event={() => null} />
<svelte:document on:event={() => null} />
<svelte:body on:event={() => null} />

<!-- not reported - deprecated -->
<slot />

<!-- not reported - components -->
{#if true}
	<svelte:self />
{/if}
<Foo />
<svelte:component this={"foo"} />

<!-- not reported - `this` can be bound to both void and non-void tags -->
<svelte:element this="dif" />

<!-- invalid and reported -->
<div />
<my-thing />
<svelte:head />
<Foo>
	<svelte:fragment slot="footer" />
</Foo>
