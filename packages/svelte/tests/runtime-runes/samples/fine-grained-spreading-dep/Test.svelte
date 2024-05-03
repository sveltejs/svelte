<script>
  let { about, ...rest } = $props();

  $effect(()=>{
	console.log(about);
  })
</script>