<!-- valid -->
<Bar baz />
<MyComponent role="combobox" />
<div />
<div></div>
<div role={role} />
<div role={role || "button"} />
<div role={role || "foobar"} />
<div role="row" />
<span role="checkbox" aria-checked="false" aria-labelledby="foo" tabindex="0"></span>
<input type="checkbox" role="switch" />
<!-- invalid -->
<!-- slider -->
<div role="slider" />
<div role="slider" aria-valuemax={1} />
<div role="slider" aria-valuemax={1} aria-valuemin={1} />
<div role="slider" aria-valuemax={1} aria-valuenow={1} />
<div role="slider" aria-valuemin={1} aria-valuenow={1} />
<!-- spinbutton -->
<div role="spinbutton" />
<div role="spinbutton" aria-valuemax={1} />
<div role="spinbutton" aria-valuemax={1} aria-valuemin={1} />
<div role="spinbutton" aria-valuemax={1} aria-valuenow={1} />
<div role="spinbutton" aria-valuemin={1} aria-valuenow={1} />
<!-- checkbox -->
<div role="checkbox" />
<div role="checkbox" checked />
<div role="checkbox" aria-chcked />
<span role="checkbox" aria-labelledby="foo" tabindex="0"></span>
<!-- combobox -->
<div role="combobox" />
<div role="combobox" expanded />
<div role="combobox" aria-expandd />
<!-- scrollbar -->
<div role="scrollbar" />
<div role="scrollbar" aria-valuemax={1} />
<div role="scrollbar" aria-valuemax={1} aria-valuemin={1} />
<div role="scrollbar" aria-valuemax={1} aria-valuenow={1} />
<div role="scrollbar" aria-valuemin={1} aria-valuenow={1} />

<script>
  let Bar, MyComponent, role, props;
</script>