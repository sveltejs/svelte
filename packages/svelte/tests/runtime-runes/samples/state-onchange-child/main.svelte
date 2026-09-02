<script>
	let a = $state({});

	let b = $state({ count: 0 }, {
		onchange() {
			console.log('b changed');
		}
	});

	a.b = b;
</script>

<button onclick={()=> b.count++}>{b.count}</button>
