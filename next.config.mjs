import withSerwistInit from "@serwist/next";
const withSerwist = withSerwistInit({
    swSrc: "src/app/sw.ts",
    swDest: "public/sw.js",
    reloadOnOnline: true
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
      config.externals.push("pino-pretty", "lokijs", "encoding");
      return config;
    },
    distDir: 'build'
};
