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