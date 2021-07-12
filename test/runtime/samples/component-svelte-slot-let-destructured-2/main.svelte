<script>
	import Nested from "./Nested.svelte";
	let c = 0, d = 0, e = 0;
</script>

<div>
	<Nested props={['hello', 'world']}>
		<svelte:fragment slot="main" let:value={pair} let:data={foo}>
			{pair[0]} {pair[1]} {c} {foo}
		</svelte:fragment>
	</Nested>

	<button on:click={() => { c += 1; }}>Increment</button>
</div>

<div>
	<Nested props={['hello', 'world']}>
		<svelte:fragment slot="main" let:value={[a, b]} let:data={foo}>
			{a} {b} {d} {foo}
		</svelte:fragment>
	</Nested>

	<button on:click={() => { d += 1; }}>Increment</button>
</div>

<div>
	<Nested props={{ a: 'hello', b: 'world' }}>
		<svelte:fragment slot="main" let:value={{ a, b }} let:data={foo}>
			{a} {b} {e} {foo}
		</svelte:fragment>
	</Nested>

	<button on:click={() => { e += 1; }}>Increment</button>
</div>