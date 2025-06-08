<script lang="ts">
	let count = 0;
	function* test(){
		while (true) {
			yield count++;
		}
	}
	let [one, two] = $state(test())
</script>

{one}, {two}