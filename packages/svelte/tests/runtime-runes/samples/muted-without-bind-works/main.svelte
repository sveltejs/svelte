<script>
	let muted = $state(false);
		
	function volume_change(node){		
		node.addEventListener("volumechange", () => {
			console.log(node.muted);
		});
	}
</script>

<audio use:volume_change {muted}></audio>
<button onclick={() => (muted = !muted)}></button>

