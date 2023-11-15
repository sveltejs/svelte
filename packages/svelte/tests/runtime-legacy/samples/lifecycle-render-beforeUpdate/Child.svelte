<script>
	export let name;
	export let log;
	$: log.push('name in child: ' + name);
</script>

<p>welcome, dan</p>
