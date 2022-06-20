<script>
	export let props = {
		'data-foo': 'bar',
		'data-named': 'qux'
	};
	export let color = 'red';
</script>

<div {...props} data-named="value">{color}</div>
