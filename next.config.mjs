/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production' || process.env.GITHUB_ACTIONS === 'true';

const nextConfig = {
  // 仅在 GitHub Actions 构建时启用静态导出
  ...(isProd ? { output: 'export' } : {}),
  basePath: isProd ? '/xianlu-workwear' : '',
  images: {
    unoptimized: isProd,   // 静态导出时禁用 Image 优化
    remotePatterns: isProd ? [] : [{ protocol: 'https', hostname: '**' }],
  },
  // 强制固定 buildId，确保文件名变化以绕过 GitHub Pages CDN 缓存
  generateBuildId: () => 'v0-3-9-footer-minimal',
};

export default nextConfig;
