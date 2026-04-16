import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:5173",
      adminCors: process.env.ADMIN_CORS || "http://localhost:5173",
      authCors: process.env.AUTH_CORS || "http://localhost:5173",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    // 🔹 Payment Module
    {
      resolve: "@medusajs/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/ssl-commerz",
            id: "commerz",
            options: {
              store_id: process.env.SSLCOMMERZ_STORE_ID,
              store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
              is_live: process.env.SSLCOMMERZ_IS_LIVE === "true",
            },
          },
        ],
      },
    },

    // 🔹 File Upload Module (Cloudinary)
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve:
              "@ridoy_sarker/medusa-cloudinary/providers/cloudinary",
            id: "cloudinary",
            options: {
              cloudName: process.env.CLOUDINARY_CLOUD_NAME,
              apiKey: process.env.CLOUDINARY_API_KEY,
              apiSecret: process.env.CLOUDINARY_API_SECRET,
              folderName: "medusa-products",
              secure: true,
            },
          },
        ],
      },
    },
  ]
})