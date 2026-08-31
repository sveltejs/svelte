<script>
	import Child from './Child.svelte';

	let count = $state(0);
	let promise = $state(Promise.resolve(1));
</script>

<!-- this is a non-closure read of state declared in `<script>`, so it _should_ warn -->
{let double1 = count}

<!-- same, but nested inside a block; should still warn -->
{#each [1, 2, 3] as item}
	{let double2 = count}
	{double2}
{/each}

<!-- same, but nested inside an await block; should still warn -->
{#await promise then value}
	{let double3 = count}
	{double3}
{/await}

<!-- this reads `count` inside a closure, so it should _not_ warn -->
{let fn = () => count}

<!-- this reads `count` inside `$derived(...)`, so it should _not_ warn either -->
{let derived1 = $derived(count * 2)}

<!-- a snippet body is a real closure (invoked separately, possibly many times), so this
     should _not_ warn either, even though it looks just like the top-level case above -->
{#snippet mysnippet()}
	{let double4 = count}
	{double4}
{/snippet}
{@render mysnippet()}

<!-- default slot content compiles to an implicit `children` snippet, so this should
     _not_ warn either -->
<Child>
	{let double5 = count}
	{double5}
</Child>

{double1}{fn}{derived1}
