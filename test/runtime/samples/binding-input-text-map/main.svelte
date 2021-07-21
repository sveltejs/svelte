<script>
  export let id = 1;
  export let map = new Map();
	map.set(id, { x: 50, y: 50 });
</script>

<input bind:value={map.get(id).x} />
