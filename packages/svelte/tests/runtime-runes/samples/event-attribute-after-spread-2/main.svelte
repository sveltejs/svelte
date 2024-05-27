<script lang="ts">
	const props = {};
	let changed = $state('');
</script>

<div {...props} ona={() => (changed = 'a')} onb={() => (changed = 'b')}>
	{changed}
</div>
