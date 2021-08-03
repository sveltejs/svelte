<script>let z = 42;</script>

<script context="module">let z = 42;</script>

{@html '<script>let c = 3;</script>'}

<script context="worker">let z = 42;</script>

{@html `
  <script>
    let e = 5;
  </script>
`}

<script>let z = 42;</script>
