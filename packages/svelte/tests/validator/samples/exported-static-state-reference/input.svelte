<script lang="ts">
	let count = $state(0);

	export { count };
</script>

<button onclick={() => (count += 1)}>
	{count}
</button>
