<script>
	import Foo from "./Foo.svelte";
	export let value = 2;
	export let array = [1, 2, 3];
</script>

<Foo {value}>
	{#if array[0]}
		{@const sum = array[0] + value}
		{#if sum > 5}
			<svelte:fragment slot="alert">#0 > 5</svelte:fragment>
		{/if}
		<svelte:fragment slot="child" let:value>
			<span>{value} ~ {sum}</span>
			<Foo value={sum}>
				{#if array[1]}
					{@const sum = array[0] + array[1] + value}
					{#if sum > 5}
						<svelte:fragment slot="alert">#1 > 5</svelte:fragment>
					{/if}
					<svelte:fragment slot="child" let:value>
						<span>{value} ~ {sum}</span>
						<Foo value={sum}>
							{#if array[2]}
								{@const sum = array[1] + array[2] + value}
								{#if sum > 5}
									<svelte:fragment slot="alert">#2 > 5</svelte:fragment>
								{/if}
								<svelte:fragment slot="child" let:value>
									<span>{value} ~ {sum}</span>
								</svelte:fragment>
							{/if}
						</Foo>
					</svelte:fragment>
				{/if}
			</Foo>
		</svelte:fragment>
	{/if}
</Foo>
