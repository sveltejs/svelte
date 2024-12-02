<script>
	import Component1 from './Component1.svelte';
	import Component2 from './Component2.svelte';
	import Component3 from './Component3.svelte';

	let count = $state({ value: 0 });
</script>

<Component1>
	<Component2>
		<Component3 bind:count></Component3>
	</Component2>
</Component1>
