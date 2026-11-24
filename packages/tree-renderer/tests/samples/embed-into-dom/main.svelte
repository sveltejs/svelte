<svelte:options customRenderer={null} />

<script lang="ts">
	import Label from './Label.svelte';

	let visible = $state(true);

	export function toggle() {
		visible = !visible;
	}
</script>

<section>{#if visible}<Label text="from the tree" />{/if}</section>
