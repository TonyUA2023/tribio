<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Profile;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Genera el sitemap.xml dinámico para todas las mini-páginas
     * Ayuda a que Google indexe todas las páginas de TRIBIO
     */
    public function index()
    {
        // Obtener todas las cuentas activas con sus perfiles
        $accounts = Account::query()
            ->with('profiles')
            ->get();

        $urls = [];

        // Agregar URL principal
        $urls[] = [
            'loc' => url('/'),
            'lastmod' => now()->toAtomString(),
            'changefreq' => 'weekly',
            'priority' => '1.0',
        ];

        // Agregar URLs de cada mini-página
        foreach ($accounts as $account) {
            // URL de la cuenta (perfil por defecto)
            $urls[] = [
                'loc' => url("/{$account->slug}"),
                'lastmod' => $account->updated_at->toAtomString(),
                'changefreq' => 'daily',
                'priority' => '0.9',
            ];

            // URLs de perfiles específicos (si hay múltiples)
            foreach ($account->profiles as $profile) {
                if ($profile->slug) {
                    $urls[] = [
                        'loc' => url("/{$account->slug}/{$profile->slug}"),
                        'lastmod' => $profile->updated_at->toAtomString(),
                        'changefreq' => 'daily',
                        'priority' => '0.8',
                    ];
                }
            }
        }

        // Generar XML
        $xml = $this->generateSitemapXml($urls);

        return response($xml, 200)
            ->header('Content-Type', 'application/xml');
    }

    /**
     * Genera el XML del sitemap
     */
    protected function generateSitemapXml(array $urls): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        foreach ($urls as $url) {
            $xml .= '<url>';
            $xml .= '<loc>' . htmlspecialchars($url['loc']) . '</loc>';
            $xml .= '<lastmod>' . $url['lastmod'] . '</lastmod>';
            $xml .= '<changefreq>' . $url['changefreq'] . '</changefreq>';
            $xml .= '<priority>' . $url['priority'] . '</priority>';
            $xml .= '</url>';
        }

        $xml .= '</urlset>';

        return $xml;
    }

    /**
     * Genera robots.txt dinámico
     */
    public function robots()
    {
        $content = "User-agent: *\n";
        $content .= "Allow: /\n";
        $content .= "Disallow: /admin\n";
        $content .= "Disallow: /settings\n";
        $content .= "Disallow: /api\n";
        $content .= "\n";
        $content .= "Sitemap: " . url('/sitemap.xml') . "\n";

        return response($content, 200)
            ->header('Content-Type', 'text/plain');
    }
}
