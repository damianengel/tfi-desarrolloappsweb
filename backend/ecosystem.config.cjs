module.exports = {
  apps: [
    {
      name: 'clinica-api',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '300M',
      time: true,
    },
  ],
};
