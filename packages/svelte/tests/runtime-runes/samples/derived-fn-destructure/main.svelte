<script>
	import {log} from './log.js'

  let count = $state(0);
	function create_derived() {
		log.push('create_derived');
		return () => {
			return {
				get double() {
					return count * 2;
				}
			}
		}
	}
  let {double} = $derived.by(create_derived());
</script>

<button on:click={() => count++}>{double}</button>
