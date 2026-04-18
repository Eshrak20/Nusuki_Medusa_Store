// src/api/middlewares.ts
import { MiddlewaresConfig } from "@medusajs/framework/http"

export const config: MiddlewaresConfig = {
  routes: [
    {
      // Match all success, fail, cancel, and ipn routes
      matcher: "/store/sslcommerz/*",
      // This is the CRITICAL line: it tells Medusa NOT to 
      // check for the Publishable API Key on these routes.
      method: "POST",
      bodyParser: {
        sizeLimit: "500kb",
      },
      // In Medusa v2, routes with 'matcher' are public by default 
      // if you don't apply authentication middlewares here.
    },
  ],
}