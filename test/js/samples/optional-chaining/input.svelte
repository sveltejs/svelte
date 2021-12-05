<script>
  export let a;
  export let b;
  export let c;
  export let d;
  export let e;
  export let f;
  let Component;
</script>

{a.normal}{b?.optional}
{c['computed']}{d?.['computed_optional']}
{e()}{f?.()}

<div
  a={a.normal}
  b={b?.optional}
  c={c['computed']}
  d={d?.['computed_optional']}
  e={e()}
  f={f?.()}
/>

<Component
  a={a.normal}
  b={b?.optional}
  c={c['computed']}
  d={d?.['computed_optional']}
  e={e()}
  f={f?.()}
/>
