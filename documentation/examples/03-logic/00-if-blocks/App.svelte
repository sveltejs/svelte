<script>
  let user = { loggedIn: false };
</script>

<button on:click={() => user.loggedIn = !user.loggedIn}>
  {user.loggedIn ? "Log out" : "Log in"}
</button>
