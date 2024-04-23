/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
      config.externals.push("pino-pretty", "lokijs", "encoding");
      return config;
    },
    distDir: 'build',
    transpilePackages: ['@ringsnetwork/rings-node'],

};

export default nextConfig