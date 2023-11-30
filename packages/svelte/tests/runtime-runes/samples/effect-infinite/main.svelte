<script>
  const v = { value: 1 };
  let s = $state(v)

  $effect(() => {
		s = v;
		s;
	});
</script>

{JSON.stringify(s)}
