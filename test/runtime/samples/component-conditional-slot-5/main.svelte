<script>
	import Foo from './Foo.svelte';
</script>

<div>
	<Foo>
		<svelte:fragment slot="top">Top content</svelte:fragment>
	</Foo>
</div>

<div>
	<Foo>
		<svelte:fragment slot="top">Top content</svelte:fragment>
		<svelte:fragment slot="bottom">Bottom content</svelte:fragment>
	</Foo>
</div>

<div>
	<Foo>
		<svelte:fragment slot="middle">Middle Content</svelte:fragment>
	</Foo>
</div>
