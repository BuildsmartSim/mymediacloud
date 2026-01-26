/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Required for Docker
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
