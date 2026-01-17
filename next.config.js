/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Отключаем ESLint во время сборки на Vercel (проверка типов все равно выполняется)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Продолжаем проверку типов, но не блокируем сборку при ошибках
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
