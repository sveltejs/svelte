<script>
  // export multiple subscribables in one line
  export let u1, s1, u2, s2

  let p1, p2, p3

  // export previously declared props
  export { p1, p3 }

  // aliased props <component a1={...} a2={...}> assign to v1, v2
  let v1, v2
  export { v1 as a1, v2 as a2 }

  // aliased export with initializer
  let vi1 = v2
  export { vi1 as a3 }

  // aliased subscribable export
  let vs1 = v1
  export { vs1 as a4 }

  // aliased with literal initializer
  let vl1 = 'test'
  export { vl1 as a5 }

  // aliased store surrounded by non-aliased non-stores
  let n1, n2, s3
  export { n1, s3 as a6, n2 }

  // keyword exports
  let k1, k2
  export { k1 as for, k2 as continue }

</script>

$s1={$s1}
$s2={$s2}
p1={p1}
p3={p3}
$v1={$v1}
v2={v2}
vi1={vi1}
$vs1={$vs1}
vl1={vl1}
$s3={$s3}
{k1}{k2}
