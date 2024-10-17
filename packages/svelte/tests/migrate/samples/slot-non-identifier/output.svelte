<script>
	import Comp from "./Component.svelte";
</script>

<Comp>
	<!-- @migration-task: migrate this slot by hand -->
	<div slot="cool:stuff">
		cool
	</div>
</Comp>

<Comp>
	<!-- @migration-task: migrate this slot by hand -->
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
	<!-- @migration-task: migrate this slot by hand -->
	<svelte:fragment slot="cool:stuff">
		cool
	</svelte:fragment>
</Comp>

<Comp>
	<!-- @migration-task: migrate this slot by hand -->
	<svelte:fragment slot="cool stuff">
		cool
	</svelte:fragment>
</Comp>

<Comp>
	{#snippet stuff()}
	
			cool
		
	{/snippet}
</Comp>