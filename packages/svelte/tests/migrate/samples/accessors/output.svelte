<script lang="ts">
	
	
	interface Props {
		test: string;
		count?: number;
		stuff: any;
		cool?: import('svelte').Snippet;
	}

	let {
		test,
		count = 0,
		stuff,
		cool
	}: Props = $props();

	export {
		test,
		count,
		stuff,
		cool,
	}
</script>

<button>
	{@render cool?.()}
</button>

<svelte:options immutable/>