<svelte:options tag="my-app"/>

<script>
	import { onMount } from 'svelte';

	export let wasCreated;
	export let propsSetBeforeMount;
	export let attrs;

	onMount(() => {
		wasCreated = true;
		propsSetBeforeMount = attrs === 'should be set';
	});
</script>
