<!-- `$derived` reads happen inside a closure, so these should _not_ warn -->
{let a = $state(0), b = $derived(a * 2)}
{let c = $state(0)}
{let d = $derived(c * 2)}

<!-- this is a non-closure read of state, so it _should_ warn -->
{let e = $state(0), f = e}

{a}{b}{c}{d}{e}{f}
