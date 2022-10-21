<script>
  import { onDestroy } from "svelte"
  onDestroy(() => {
		const el = document.querySelector('#show')
		console.log(`Element exist ${!!el}`)
    console.log("Custom component destroyed.")
  })
</script>

<p>Hello</p>