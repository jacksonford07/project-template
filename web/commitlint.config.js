module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation changes
        'style',    // Code style (formatting, semicolons, etc)
        'refactor', // Code refactoring without changing functionality
        'perf',     // Performance improvements
        'test',     // Adding or fixing tests
        'chore',    // Maintenance (deps, configs, etc)
        'ci',       // CI/CD changes
        'build',    // Build system changes
        'revert',   // Reverting previous commits
      ],
    ],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-empty': [2, 'never'],
    'header-max-length': [2, 'always', 72],
  },
};
