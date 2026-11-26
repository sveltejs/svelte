<script>
	import HelloWorld from './HelloWorld.svelte';

	let Component = $state();

	$effect.pre(() => {
		Component = HelloWorld;
	});
</script>

<h1>Test</h1>

<Component />
