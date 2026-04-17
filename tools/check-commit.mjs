import { execFileSync } from 'node:child_process';

const args = new Set(process.argv.slice(2));
const mode = args.has('--pre-push') ? 'pre-push' : 'pre-commit';

const driftTrackedFiles = new Set(['apps/web/next-env.d.ts']);

function git(...gitArgs) {
    return execFileSync('git', gitArgs, {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
}

function lines(value) {
    return value ? value.split(/\r?\n/).filter(Boolean) : [];
}

function formatList(items) {
    return items.map((item) => `- ${item}`).join('\n');
}

function fail(message) {
    console.error(`[check-commit] ${message}`);
    process.exit(1);
}

const staged = lines(git('diff', '--name-only', '--cached', '--diff-filter=ACMRTUXB'));
const unstaged = lines(git('diff', '--name-only', '--diff-filter=ACMRTUXB'));
const untracked = lines(git('ls-files', '--others', '--exclude-standard'));
const driftTracked = [...new Set([...staged, ...unstaged])].filter((file) =>
    driftTrackedFiles.has(file)
);

if (driftTracked.length > 0) {
    fail(
        [
            'Drift-prone tracked files changed. Restore them before continuing:',
            formatList(driftTracked),
            'Known generated truth surfaces such as packages/contracts/generated/** are excluded from this denylist.',
        ].join('\n')
    );
}

if (mode === 'pre-commit') {
    if (unstaged.length > 0 || untracked.length > 0) {
        const parts = [
            'Commit blocked: worktree contains uncommitted changes outside the staged set.',
        ];

        if (unstaged.length > 0) {
            parts.push('Unstaged tracked changes:');
            parts.push(formatList(unstaged));
        }

        if (untracked.length > 0) {
            parts.push('Untracked files:');
            parts.push(formatList(untracked));
        }

        parts.push(
            'Stage the intended files, restore drift artifacts, or move generated output into ignored paths/tmp before committing.'
        );

        fail(parts.join('\n'));
    }

    if (staged.length === 0) {
        fail('Commit blocked: no staged files were found.');
    }

    console.log('[check-commit] pre-commit worktree audit passed.');
    process.exit(0);
}

if (staged.length > 0 || unstaged.length > 0 || untracked.length > 0) {
    const parts = ['Push blocked: worktree must be clean before push.'];

    if (staged.length > 0) {
        parts.push('Staged files:');
        parts.push(formatList(staged));
    }

    if (unstaged.length > 0) {
        parts.push('Unstaged tracked changes:');
        parts.push(formatList(unstaged));
    }

    if (untracked.length > 0) {
        parts.push('Untracked files:');
        parts.push(formatList(untracked));
    }

    parts.push('Commit intended changes first and restore/delete drift artifacts before pushing.');
    fail(parts.join('\n'));
}

console.log('[check-commit] pre-push worktree audit passed.');
