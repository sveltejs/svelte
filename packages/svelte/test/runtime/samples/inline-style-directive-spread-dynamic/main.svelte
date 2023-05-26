<script>
  export let color = 'blue';
  export let obj = { id: 'my-id', style: 'width: 65px' };
</script>
<p {...obj} style:color={color} />
