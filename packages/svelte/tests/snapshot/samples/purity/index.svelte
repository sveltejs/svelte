<script>
	let min = 0;
	let max = 100;
	let number = 50;

	let value = 'hello';
</script>

<p>{Math.max(min, Math.min(max, number))}</p>
<p>{location.href}</p>

<Child prop={encodeURIComponent(value)} />
