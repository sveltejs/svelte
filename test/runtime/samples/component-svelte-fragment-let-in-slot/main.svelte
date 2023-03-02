<script>
	import Outer from './Outer.svelte'
	import Inner from './Inner.svelte'

	export let prop
</script>

<Outer {prop}>
	<svelte:fragment slot="main" let:value>
		<Inner>
			<svelte:fragment slot="main">
				{value}
			</svelte:fragment>
		</Inner>
	</svelte:fragment>
</Outer>
