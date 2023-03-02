if (process.env.SKIP_PREPARE) {
  console.log('Skipped "prepare" script');
} else {
	const { execSync } = require("child_process");
	const command = process.argv.slice(2).join(" ");
	execSync(command, { stdio: "inherit" });
}
