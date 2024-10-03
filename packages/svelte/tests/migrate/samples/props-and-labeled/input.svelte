<script>
	export let readonly;
	$: writable = !readonly;
	export let optional = 'foo';
</script>

{readonly} {optional} {writable}