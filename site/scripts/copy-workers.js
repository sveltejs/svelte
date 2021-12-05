import sh from 'shelljs';

sh.rm('-rf', 'static/workers');
sh.cp('-r', 'node_modules/@sveltejs/svelte-repl/workers', 'static');
