<script>
	function setKey(key, value) {
		console.log(`setKey(${key}, ${value})`);
	}
</script>

<slot key="a" set={setKey} />
<slot key="b" set={setKey} />
