<script>
	let button = { title: '', label: '' };
	let title = '';
	let label = '';

	title = label = '1'; // to add dependencies/generate update block

	$: button.title = title;
	$: button.label = label;
</script>

{button.title} {button.label}
