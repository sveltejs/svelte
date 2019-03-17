<script>
	export let numbers;
</script>

{numbers.filter(x => x % 2).join(', ')}