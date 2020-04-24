<script>
  import { obj } from './data.js'
	
	$: prop = obj.prop
  obj.foo = 'uncomment this line to break the example'
</script>

{prop}
