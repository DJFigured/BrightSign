import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: (() => {
        if (process.env.JWT_SECRET) return process.env.JWT_SECRET
        if (process.env.NODE_ENV === "production") throw new Error("JWT_SECRET is required in production. Set it in environment variables.")
        console.warn("⚠️  JWT_SECRET not set — using insecure default for development only.")
        return "dev-insecure-jwt-change-me"
      })(),
      cookieSecret: (() => {
        if (process.env.COOKIE_SECRET) return process.env.COOKIE_SECRET
        if (process.env.NODE_ENV === "production") throw new Error("COOKIE_SECRET is required in production. Set it in environment variables.")
        console.warn("⚠️  COOKIE_SECRET not set — using insecure default for development only.")
        return "dev-insecure-cookie-change-me"
      })(),
    },
  },
  modules: [
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: "@medusajs/medusa/caching",
      options: {
        providers: [
          {
            resolve: "@medusajs/caching-redis",
            id: "caching-redis",
            is_default: true,
            options: {
              redisUrl: process.env.REDIS_URL,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: {
          redisUrl: process.env.REDIS_URL,
        },
      },
    },
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            is_default: true,
            options: {
              redisUrl: process.env.REDIS_URL,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          process.env.S3_ENDPOINT
            ? {
                resolve: "@medusajs/medusa/file-s3",
                id: "s3",
                options: {
                  file_url: process.env.S3_FILE_URL,
                  access_key_id: process.env.S3_ACCESS_KEY,
                  secret_access_key: process.env.S3_SECRET_KEY,
                  region: process.env.S3_REGION || "us-east-1",
                  bucket: process.env.S3_BUCKET || "brightsign-media",
                  endpoint: process.env.S3_ENDPOINT,
                  additional_client_config: {
                    forcePathStyle: true,
                  },
                },
              }
            : {
                resolve: "@medusajs/file-local",
                id: "local",
                options: {
                  upload_dir: process.env.FILE_UPLOAD_DIR || "uploads",
                  backend_url: `${process.env.BACKEND_URL || "http://localhost:9000"}/uploads`,
                },
              },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              capture: true,
            },
          },
          {
            resolve: "./src/modules/bank-transfer",
            id: "bank-transfer",
          },
        ],
      },
    },
    {
      resolve: "./src/modules/invoice",
    },
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "./src/modules/packeta",
            id: "packeta",
            options: {
              api_password: process.env.PACKETA_API_PASSWORD,
              sender_id: process.env.PACKETA_SENDER_ID,
              api_key: process.env.PACKETA_API_KEY,
            },
          },
        ],
      },
    },
  ],
})
