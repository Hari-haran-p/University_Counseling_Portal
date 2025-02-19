/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb", // or '5mb', '10mb', etc. Adjust as needed
    },
  },
  images: {
    domains: ["utfs.io"],
  },
};

export default nextConfig;
