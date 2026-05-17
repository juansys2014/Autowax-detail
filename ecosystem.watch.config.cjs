/** @type {import('pm2').StartOptions} */
const base = require('./ecosystem.config.cjs')

module.exports = {
  apps: [
    ...base.apps,
    {
      name: 'autowax-watcher',
      cwd: __dirname,
      script: 'node_modules/.bin/nodemon',
      args: '--config nodemon.watch.json --no-run-on-start',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      error_file: 'logs/pm2-watcher-error.log',
      out_file: 'logs/pm2-watcher-out.log',
      merge_logs: true,
      time: true,
    },
  ],
}
