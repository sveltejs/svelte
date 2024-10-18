<script>
	import Comp from "./Component.svelte";
</script>

<Comp>
	<div slot="cool:stuff">
		cool
	</div>
</Comp>

<Comp>
	<div slot="cool stuff">
		cool
	</div>
</Comp>

<Comp>
	<div slot="stuff">
		cool
	</div>
</Comp>

<Comp>
	<svelte:fragment slot="cool:stuff">
		cool
	</svelte:fragment>
</Comp>

<Comp>
	<svelte:fragment slot="cool stuff">
		cool
	</svelte:fragment>
</Comp>

<Comp>
	<svelte:fragment slot="stuff">
		cool
	</svelte:fragment>
</Comp>


<!-- don't remove the let directive if we don't migrate -->

<Comp>
	<div let:should_stay slot="cool:stuff">
		cool
	</div>
</Comp>

<Comp>
	<div let:should_stay slot="cool stuff">
		cool
	</div>
</Comp>

<Comp>
	<svelte:fragment let:should_stay slot="cool:stuff">
		cool
	</svelte:fragment>
</Comp>

<Comp>
	<svelte:fragment let:should_stay slot="cool stuff">
		cool
	</svelte:fragment>
</Comp>