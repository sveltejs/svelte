<script>
	import Comp from "./Component.svelte";
</script>

<Comp stuff="cool">
	<div slot="stuff">
		cool
	</div>
</Comp>

<Comp stuff="cool">
	<svelte:fragment slot="stuff">
		cool
	</svelte:fragment>
</Comp>

<!-- don't remove the let if we are not migrating -->

<Comp stuff="cool">
	<div let:should_stay slot="stuff">
		cool
	</div>
</Comp>

<Comp stuff="cool">
	<svelte:fragment let:should_stay slot="stuff">
		cool
	</svelte:fragment>
</Comp>