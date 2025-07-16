/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['images.pexels.com', 'api.pexels.com'],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  experimental: {
    outputFileTracingExcludes: {
      '/api/**/*': ['node_modules/**/*'],
    },
  },
  // CSS Modules configuration
  sassOptions: {
    includePaths: ['./styles'],
  },
  // Ensure CSS Modules work properly
  webpack: (config) => {
    // Ensure CSS modules are properly handled
    config.module.rules.forEach((rule) => {
      if (rule.test && rule.test.toString().includes('css')) {
        if (rule.use) {
          rule.use.forEach((use) => {
            if (use.loader && use.loader.includes('css-loader') && use.options) {
              // Ensure CSS modules are enabled for .module.css files
              if (use.options.modules) {
                use.options.modules.localIdentName = '[name]__[local]___[hash:base64:5]';
              }
            }
          });
        }
      }
    });
    return config;
  },
}

module.exports = nextConfig