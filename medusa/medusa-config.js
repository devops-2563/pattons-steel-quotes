const { loadEnv, defineConfig } = require("@medusajs/framework/utils");

loadEnv(process.env.NODE_ENV, process.cwd());

const modules = [
  {
    resolve: "./src/modules/fashion",
  },
];

// ✅ File Service
if (process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY) {
  modules.push({
    resolve: "@medusajs/medusa/file",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/file-s3",
          id: "s3",
          options: {
            file_url: process.env.S3_FILE_URL,
            access_key_id: process.env.S3_ACCESS_KEY_ID,
            secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
            region: process.env.S3_REGION,
            bucket: process.env.S3_BUCKET,
            endpoint: process.env.S3_ENDPOINT,
            additional_client_config: {
              forcePathStyle:
                process.env.S3_FORCE_PATH_STYLE === "true" ? true : undefined,
            },
          },
        },
      ],
    },
  });
} else {
  // ✅ fallback to local
  modules.push({
    resolve: "@medusajs/medusa/file",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/file-local",
          id: "local",
          options: {
            upload_dir: "uploads",
          },
        },
      ],
    },
  });
}

// ✅ Notification (Resend)
modules.push({
  resolve: "@medusajs/medusa/notification",
  options: {
    providers: [
      {
        resolve: "./src/modules/resend",
        id: "resend",
        options: {
          channels: ["email"],
          api_key: process.env.RESEND_API_KEY,
          from: process.env.RESEND_FROM,
          siteTitle: "SofaSocietyCo.",
          companyName: "Sofa Society",
          footerLinks: [
            { url: "https://agilo.com", label: "Agilo" },
            { url: "https://www.instagram.com/agiloltd/", label: "Instagram" },
            {
              url: "https://www.linkedin.com/company/agilo/",
              label: "LinkedIn",
            },
          ],
        },
      },
    ],
  },
});

// ✅ Stripe only if env set
if (process.env.STRIPE_API_KEY) {
  modules.push({
    resolve: "@medusajs/medusa/payment",
    options: {
      providers: [
        {
          id: "stripe",
          resolve: "@medusajs/medusa/payment-stripe",
          options: {
            apiKey: process.env.STRIPE_API_KEY,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
          },
        },
      ],
    },
  });
}

// ✅ Meilisearch only if env set
if (process.env.MEILISEARCH_API_KEY) {
  modules.push({
    resolve: "./src/modules/meilisearch",
    options: {
      config: {
        host:
          process.env.MEILISEARCH_HOST ??
          "https://fashion-starter-search.agilo.agency",
        apiKey: process.env.MEILISEARCH_API_KEY,
      },
      settings: {
        /* … your settings unchanged … */
      },
    },
  });
}

module.exports = defineConfig({
  admin: {
    backendUrl:
      process.env.BACKEND_URL ?? "https://sofa-society-starter.medusajs.app",
    storefrontUrl: process.env.STOREFRONT_URL,
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS,
      adminCors: process.env.ADMIN_CORS,
      authCors: process.env.AUTH_CORS,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules,
  plugins: [
    {
      resolve: "@agilo/medusa-analytics-plugin",
      options: {},
    },
  ],
});
