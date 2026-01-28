<script>
	import Comp from "./Component.svelte";
</script>

<Comp stuff="cool">
	<!-- @migration-task: migrate this slot by hand, `stuff` would shadow a prop on the parent component -->
	<div slot="stuff">
		cool
	</div>
</Comp>

<Comp stuff="cool">
	<!-- @migration-task: migrate this slot by hand, `stuff` would shadow a prop on the parent component -->
	<svelte:fragment slot="stuff">
		cool
	</svelte:fragment>
</Comp>

<!-- don't remove the let if we are not migrating -->

<Comp stuff="cool">
	<!-- @migration-task: migrate this slot by hand, `stuff` would shadow a prop on the parent component -->
	<div let:should_stay slot="stuff">
		cool
	</div>
</Comp>

<Comp stuff="cool">
	<!-- @migration-task: migrate this slot by hand, `stuff` would shadow a prop on the parent component -->
	<svelte:fragment let:should_stay slot="stuff">
		cool
	</svelte:fragment>
</Comp>