<script>
	export let data
	$: ({ foo } = data)

	import { blah } from './blah.js'

	let bar
	$: {
		bar = []
		let baz
	}
</script>