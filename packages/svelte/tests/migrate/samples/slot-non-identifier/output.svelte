<script>
	import Comp from "./Component.svelte";
</script>

<Comp>
	<!-- @migration-task: migrate this slot by hand, `cool:stuff` is an invalid identifier -->
	<div slot="cool:stuff">
		cool
	</div>
</Comp>

<Comp>
	<!-- @migration-task: migrate this slot by hand, `cool stuff` is an invalid identifier -->
	<div slot="cool stuff">
		cool
	</div>
</Comp>

<Comp>
	{#snippet stuff()}
		<div >
			cool
		</div>
	{/snippet}
</Comp>

<Comp>
	<!-- @migration-task: migrate this slot by hand, `cool:stuff` is an invalid identifier -->
	<svelte:fragment slot="cool:stuff">
		cool
	</svelte:fragment>
</Comp>

<Comp>
	<!-- @migration-task: migrate this slot by hand, `cool stuff` is an invalid identifier -->
	<svelte:fragment slot="cool stuff">
		cool
	</svelte:fragment>
</Comp>

<Comp>
	{#snippet stuff()}
	
			cool
		
	{/snippet}
</Comp>


<!-- don't remove the let directive if we don't migrate -->

<Comp>
	<!-- @migration-task: migrate this slot by hand, `cool:stuff` is an invalid identifier -->
	<div let:should_stay slot="cool:stuff">
		cool
	</div>
</Comp>

<Comp>
	<!-- @migration-task: migrate this slot by hand, `cool stuff` is an invalid identifier -->
	<div let:should_stay slot="cool stuff">
		cool
	</div>
</Comp>

<Comp>
	<!-- @migration-task: migrate this slot by hand, `cool:stuff` is an invalid identifier -->
	<svelte:fragment let:should_stay slot="cool:stuff">
		cool
	</svelte:fragment>
</Comp>

<Comp>
	<!-- @migration-task: migrate this slot by hand, `cool stuff` is an invalid identifier -->
	<svelte:fragment let:should_stay slot="cool stuff">
		cool
	</svelte:fragment>
</Comp>