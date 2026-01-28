<script>
    let name = 'world';
    let count = $state(0);
</script>
<h1>Hello, {null}{name}!</h1>
<b>{1 ?? 'stuff'}{2 ?? 'more stuff'}{3 ?? 'even more stuff'}</b>
<button onclick={()=>count++}>Count is {count}</button>
<h1>Hello, {name ?? 'earth' ?? null}</h1>