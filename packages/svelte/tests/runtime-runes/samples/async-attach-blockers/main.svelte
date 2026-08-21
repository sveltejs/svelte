<script>
	import Child from "./Child.svelte";

	// Wait a macrotask to make sure the effect doesn't run before the microtask-Promise.resolve() resolves, masking a bug
	await new Promise(r => setTimeout(r));

	function createAttachment(value) {
		return () => {
			console.log(value);
		};
	}

	let attachment = $state('ready');
</script>

<div {@attach createAttachment(attachment)}></div>
<Child {@attach createAttachment(attachment)} />
