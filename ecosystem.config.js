module.exports = {
  apps: [{
    name: "bcci-api",
    script: "./index.js",
    watch: true,
    instances: "1",
    exec_mode: "cluster",
    max_memory_restart: '1G',
    env: {
      NODE_ENV: "default",
    },
    env_development: {
      NODE_ENV: "dev",
    },
    env_staging: {
      NODE_ENV: "stg",
    },
    env_production: {
      NODE_ENV: "prod",
    }
  }]
}
