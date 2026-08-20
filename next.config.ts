import type {NextConfig} from 'next';

/** Packages the embedded NestJS app must load at runtime, never bundled. */
const NEST_RUNTIME_PACKAGES = [
  '@nestjs/common',
  '@nestjs/config',
  '@nestjs/core',
  '@nestjs/platform-express',
  'class-transformer',
  'class-validator',
  'express',
  'reflect-metadata',
  'rxjs',
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
    ],
  },
  transpilePackages: ['motion'],

  // The NestJS application is mounted in pages/api/[...path].ts. Its packages must
  // load from node_modules at runtime rather than being bundled by webpack: a
  // bundled copy of @nestjs/common alongside the real one gives two different
  // HttpException classes, so `instanceof` fails and every 400 surfaces as a 500.
  // rxjs is excluded here because Next already transpiles it; it is still
  // externalised in the webpack config below.
  serverExternalPackages: NEST_RUNTIME_PACKAGES.filter((pkg) => pkg !== 'rxjs'),

  webpack: (config, { isServer }) => {
    if (isServer) {
      const existing = Array.isArray(config.externals)
        ? config.externals
        : [config.externals].filter(Boolean);

      // serverExternalPackages covers the App Router; the Pages Router server
      // build needs the same packages externalised explicitly.
      config.externals = [
        ...existing,
        ({ request }: { request?: string }, callback: (err?: unknown, result?: string) => void) => {
          if (
            request &&
            NEST_RUNTIME_PACKAGES.some(
              (pkg) => request === pkg || request.startsWith(`${pkg}/`)
            )
          ) {
            return callback(undefined, `commonjs ${request}`);
          }
          return callback();
        },
      ];
    }
    return config;
  },

};

export default nextConfig;
