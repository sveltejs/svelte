<script>
	let { 
		foo = $bindable(),
		bar = $bindable(),
		baz = $bindable()
	} = $props();
	
	bar = 'new value';
	baz.nested = 'value';
</script>

<p>{foo} {bar} {baz.nested}</p>
