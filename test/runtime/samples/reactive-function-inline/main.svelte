<script>
	let list = [0, 1, 2, 3, 4];
	export let selected = 0;
</script>

<p>{list.filter(x => x === selected)}</p>