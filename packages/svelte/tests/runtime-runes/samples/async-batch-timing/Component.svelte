<script lang="ts">
	let { ref } = $props();

	let tick = $state(0);
	let ref_exists = $state(true);
 
	$effect(() => {
		tick;
		ref_exists = ref !== null;
	});
</script>

<p>{ref_exists}</p>
<button onclick={() => tick++}>check</button>
