<script>
  export let log;
	function setKey(key, value) {
		log.push(`setKey(${key}, ${value})`);
  }
</script>

<slot key="a" set={setKey} />
<slot key="b" set={setKey} />