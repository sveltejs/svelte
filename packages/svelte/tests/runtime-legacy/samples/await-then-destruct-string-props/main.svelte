<script>
  const object = Promise.resolve({ 'prop-1': 1, 'prop2': 2, 'prop-3': 3, 'prop4': 4 });
  const objectReject = Promise.reject({ 'prop-5': 5, 'prop6': 6, 'prop-7': 7, 'prop8': 8 });
</script>

{#await object then { 'prop-1': prop1, 'prop4': fourthProp, ...rest }}
	<p>prop-1: {prop1}</p>
	<p>prop4: {fourthProp}</p>
	<p>rest: {JSON.stringify(rest)}</p>
{/await}

{#await objectReject then value}
	resolved
{:catch { 'prop-7': prop7, 'prop6': sixthProp, ...rest }}
	<p>prop-7: {prop7}</p>
	<p>prop6: {sixthProp}</p>
	<p>rest: {JSON.stringify(rest)}</p>
{/await}

