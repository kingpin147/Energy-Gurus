import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EnergyGurus - Best & Top Solar Installers in Pakistan',
    short_name: 'EnergyGurus',
    description: 'Find verified solar installers, compare tier-1 brands, and get expert solar energy consulting in Pakistan.',
    start_url: '/',
    display: 'standalone',
    background_color: '#12213a',
    theme_color: '#e8a33d',
    icons: [
      {
        src: '/icon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
