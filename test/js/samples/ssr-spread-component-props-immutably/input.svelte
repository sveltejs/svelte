<script>
	import Component from './Component.svelte';

	let props = {
		x: 1,
		y: 2,
		z: 3,
	};
</script>

<Component {...props} x={2} />
