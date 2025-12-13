// Configuration for different environments
const config = {
  development: {
    apiUrl: "http://localhost:5000/api",
  },
  production: {
    // This will be replaced during build with VITE_API_URL environment variable
    apiUrl:
      import.meta.env.VITE_API_URL ||
      "https://your-backend-url.onrender.com/api",
  },
};

// Determine current environment
const environment = import.meta.env.MODE || "development";

// Export the appropriate configuration
export const API_URL = config[environment]?.apiUrl || config.development.apiUrl;

export default {
  apiUrl: API_URL,
  environment,
};
