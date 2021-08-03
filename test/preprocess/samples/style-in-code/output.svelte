<script context="module">
  let a = '<style>div { color: blue; }</style>';
  let b = `
    <style>
      div { color: green; }
    </style>
  `;
</script>

<style>h1 { color: white; }</style>

<script>
  let c = '<style>div { color: blue; }</style>';
  let d = `
    <style>
      div { color: green; }
    </style>
  `;
</script>

{a} {b} {c} {d}

{@html '<style>div { color: yellow; }</style>'}

<style>h1 { color: white; }</style>

{@html `
  <style>
    div { color: pink; } 
  </style>
`}

<style>h1 { color: white; }</style>
