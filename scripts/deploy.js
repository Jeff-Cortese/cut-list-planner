import { execSync } from 'child_process';
import { existsSync } from 'fs';

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

if (!existsSync('build')) {
	console.error('build/ directory not found. Run "npm run build" first.');
	process.exit(1);
}

const remote = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();

run('git -C build init');
run('git -C build checkout -B gh-pages');
run('git -C build add -A');
run('git -C build commit -m "Deploy to GitHub Pages"');
run(`git -C build push ${remote} gh-pages --force`);

console.log('\nDeployed to gh-pages branch.');
