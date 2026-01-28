<script module>
	import { onMount } from 'svelte';

	class MyClass {
		constructor() {
			onMount(() => console.log('mounted'));
		}
	}
</script>

<script>
	new MyClass();
</script>
