<script>
	import Foo from "./Foo.svelte";
	export let main_constant = 1;
	export let foo_constant = 5;
	export let top = { a: 1, b: 2 };
	export let bottom = { a: 3, b: 4 };
</script>

<Foo constant={foo_constant}>
	{#if top}
		{@const sum = top.a + top.b}
		<svelte:fragment slot="top" let:constant>
			{@const csum = sum * constant * main_constant}
			{sum} ~ {csum}
		</svelte:fragment>
	{/if}
	{#if bottom}
		{@const sum = bottom.a + bottom.b}
		{#if top}
			{@const product = top.a * top.b * main_constant}
			<svelte:fragment slot="bottom" let:constant>
				{@const all = constant + product + sum}
				<div>sum: {sum} product: {product} all: {all}</div>
			</svelte:fragment>
		{:else}
			<svelte:fragment slot="bottom" let:constant>
				{@const all = constant + sum}
				<div>sum: {sum} all: {all}</div>
			</svelte:fragment>
		{/if}
	{:else}
		{@const product = foo_constant + foo_constant}
		<svelte:fragment slot="bottom" let:constant>
			{@const all = constant + product * main_constant}
			<div>{all}</div>
		</svelte:fragment>
	{/if}
</Foo>
