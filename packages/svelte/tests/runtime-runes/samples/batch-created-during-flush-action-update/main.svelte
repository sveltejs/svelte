<script>
	let count = $state(1);
	let columns = $state(1);
	let measured_width = $state(0);

	function measure(node) {
		// Action's update runs during flush - this writes state mid-batch
		// which can cause the batch to not be scheduled properly
		measured_width = node.clientWidth;
	}

	// Derived that depends on count - this creates the chain of effects
	let derived_count = $derived.by(() => {
		return count;
	});

	// Create some elements with actions that measure
	function grow() {
		count++;
		// When count changes, the derived updates, which may cause
		// the action's update to run during the flush, writing to columns
		columns = count + 1;
	}

	function change() {
		count++;
		columns = count + 2;
	}
</script>

<button onclick={grow}>grow1</button>
<button onclick={grow}>grow2</button>
<button onclick={change}>change</button>
<div use:measure>columns: {columns}</div>
