<script lang="ts">
	const props = {};
	let changed = $state(false);
</script>

{changed}
<input {...props} oninput={() => (changed = true)} class="hello" />
