<script>
	let count = $state(0);

	function listen(node){
		function handler(){
			count++;
		}
		node.addEventListener("click", handler);
		return {
			destroy(){
				node.removeEventListener("click", handler);
			}
		}
	}
</script>

<button use:listen></button>

{#await Promise.resolve() then}
	{err.or}
{/await}