<script lang="ts">
	let active = $state(false);
</script>

<div class:active>content</div>
<button onclick={() => (active = !active)}>toggle</button>
