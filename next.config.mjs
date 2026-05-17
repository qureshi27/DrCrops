/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: "10mb" }
  },
  env: {
    // Re-export the existing VITE_GOOGLE_MAPS_API_KEY from .env so it is
    // available to the browser at build time. Saves the user from having
    // to duplicate the key under a NEXT_PUBLIC_ prefix.
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      ""
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "services.sentinel-hub.com" },
      { protocol: "https", hostname: "maps.googleapis.com" }
    ]
  }
};

export default nextConfig;
