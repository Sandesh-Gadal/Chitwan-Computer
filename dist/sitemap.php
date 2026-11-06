<?php
// Serves /sitemap.xml live (see .htaccess): the fixed pages plus every category,
// brand and product from the API, so new products show up without a redeploy.
// The result is cached for an hour; if the API is down, the last good copy
// (or the fixed pages alone) is served instead.

const SITE = 'https://www.chitwancomputer.com.np';
const API = 'https://api.chitwancomputer.com.np';
const CACHE_TTL = 3600;

$cacheFile = sys_get_temp_dir() . '/ccsithub-sitemap.xml';

header('Content-Type: application/xml; charset=UTF-8');

if (is_file($cacheFile) && time() - filemtime($cacheFile) < CACHE_TTL) {
    readfile($cacheFile);
    exit;
}

function api_get(string $path)
{
    $ctx = stream_context_create(['http' => [
        'timeout' => 15,
        'header' => "Accept: application/json\r\n",
    ]]);
    // Returns false on network errors and on any non-2xx response.
    $body = @file_get_contents(API . $path, false, $ctx);
    if ($body === false) {
        throw new RuntimeException("$path: request failed");
    }
    $data = json_decode($body, true);
    if (!is_array($data)) {
        throw new RuntimeException("$path: invalid JSON");
    }
    return $data;
}

$today = date('Y-m-d');
$urls = [
    ['loc' => '/', 'priority' => '1.0', 'changefreq' => 'daily'],
    ['loc' => '/products', 'priority' => '0.9', 'changefreq' => 'daily'],
    ['loc' => '/build-pc', 'priority' => '0.8', 'changefreq' => 'weekly'],
    ['loc' => '/about', 'priority' => '0.6', 'changefreq' => 'monthly'],
];
$complete = true;

try {
    foreach (api_get('/categories') as $c) {
        if (($c['products_count'] ?? 0) > 0) {
            $urls[] = ['loc' => '/products?category=' . $c['slug'], 'priority' => '0.8', 'changefreq' => 'daily'];
        }
    }
    foreach (api_get('/brands') as $b) {
        if (($b['products_count'] ?? 0) > 0) {
            $urls[] = ['loc' => '/products?brand=' . $b['slug'], 'priority' => '0.6', 'changefreq' => 'weekly'];
        }
    }
    for ($page = 1, $last = 1; $page <= $last; $page++) {
        $data = api_get("/products?per_page=100&page=$page");
        $last = (int) ($data['last_page'] ?? 1);
        foreach ($data['data'] ?? [] as $p) {
            $urls[] = [
                'loc' => '/products/' . $p['id'],
                'priority' => '0.7',
                'changefreq' => 'weekly',
                'lastmod' => substr($p['updated_at'] ?? '', 0, 10) ?: $today,
            ];
        }
    }
} catch (Throwable $e) {
    $complete = false;
    error_log('sitemap: catalogue not added (' . $e->getMessage() . ')');
}

// API failed: prefer the last good (stale) copy over a fixed-pages-only sitemap.
if (!$complete && is_file($cacheFile)) {
    readfile($cacheFile);
    exit;
}

$xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
    . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($urls as $u) {
    $xml .= sprintf(
        "  <url><loc>%s</loc><lastmod>%s</lastmod><changefreq>%s</changefreq><priority>%s</priority></url>\n",
        htmlspecialchars(SITE . $u['loc'], ENT_XML1),
        $u['lastmod'] ?? $today,
        $u['changefreq'],
        $u['priority']
    );
}
$xml .= "</urlset>\n";

if ($complete) {
    @file_put_contents($cacheFile, $xml, LOCK_EX);
}
echo $xml;
