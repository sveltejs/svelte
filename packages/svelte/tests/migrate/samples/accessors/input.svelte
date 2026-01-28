<script lang="ts">
	type $$Props = {
		test: string;
	}
	
	export let count = 0;
	export let stuff;
</script>

<button>
	<slot name="cool" />
</button>

<svelte:options accessors immutable/>