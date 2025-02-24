<script>
    let a = 1;
    let b = 2;
    let name = 'world';
    let count = $state(0);
    function Component() {
        // placeholder component
    }
</script>
<h1>Hello, {name}!</h1>
<p>{a} + {b} = {a + b}</p>
<button onclick={() => count++}>Count is {count}</button>
<p>{1} + {2} = {1 + 2}</p>
<p>Sum is {(a, b, a + b)}</p>
<p>{a === 1 ? a : b}</p>
<Component {a} {count} c={a+b} />