// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 *
 * @type {"standalone"|"export"|undefined}
 */
/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  output: 'standalone',
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  // Конфигурация для OAuth
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://nxnext-fnse-production.up.railway.app',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  // Важно для Railway
  experimental: {
    trustHostHeader: true,
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
