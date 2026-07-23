<script>
	let active = $state(false);
</script>

<div class="base" class:active>content</div>
<button onclick={() => active = !active}>toggle</button>
