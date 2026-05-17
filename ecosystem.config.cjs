/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: 'autowax-detail',
      cwd: __dirname,
      script: 'node_modules/.bin/next',
      args: 'start -p 3011 -H 0.0.0.0',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: '3011',
      },
      // Carga variables desde .env.local (DB, JWT, URLs públicas)
      env_file: '.env.local',
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      merge_logs: true,
      time: true,
    },
  ],
}
