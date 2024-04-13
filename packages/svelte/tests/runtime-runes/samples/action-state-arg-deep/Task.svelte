<script>
	import { log } from './log.js';

  const { prop } = $props()

  let trackedState = $state(0)
  const getTrackedState = () => trackedState

  function dummyAction(el, { getTrackedState, propFromComponent }) {
    $effect(() => {
      log.push("action $effect: ", { buttonClicked: getTrackedState() })
    })
  }
</script>

<div
  class="container"
  use:dummyAction={{ getTrackedState, propFromComponent: prop }}
>
  {JSON.stringify(prop)}
</div>

<button
  onclick={() => {
    trackedState += 1
  }}
>
  update tracked state
</button>
