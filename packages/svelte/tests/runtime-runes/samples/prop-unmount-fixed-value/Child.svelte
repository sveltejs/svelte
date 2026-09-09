<script>
	import { onMount } from "svelte";

	const { value } = $props();

	onMount(() => {
		console.log("CHILD: mount value is", value);
		return () => console.log("CHILD: unmount value is", value);
	})
	
	function outro() {
		console.log("CHILD: outro value is", value);
		return { duration: 100 };
	}

	function onclick() {
		setTimeout(() => console.log("CHILD: timeout value is", value), 1000);
	}
</script>

<div out:outro>
	<button {onclick}>Set timeout</button>
</div>
