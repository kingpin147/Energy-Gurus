const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, '../src'));

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (content.includes('locale === "ur" ? "ur_PK" : "en_US"')) {
        content = content.replace(/locale === "ur" \? "ur_PK" : "en_US"/g, '"en_US"');
        changed = true;
    }

    if (content.includes('const { locale } = await params;')) {
        content = content.replace(/const\s+\{\s*locale\s*\}\s*=\s*await\s+params;/g, '');
        changed = true;
    }

    if (content.includes('generateMetadata({ params }: { params: Promise<{ locale: string }> })')) {
        content = content.replace(/generateMetadata\(\{\s*params\s*\}\s*:\s*\{\s*params:\s*Promise<\{\s*locale:\s*string\s*\}>\s*\}\)/g, 'generateMetadata()');
        changed = true;
    }

    if (content.includes('generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> })')) {
        content = content.replace(/generateMetadata\(\{\s*params\s*\}\s*:\s*\{\s*params:\s*Promise<\{\s*id:\s*string;\s*locale:\s*string\s*\}>\s*\}\)/g, 'generateMetadata({ params }: { params: Promise<{ id: string }> })');
        changed = true;
    }
    
    // Also remove languages property entirely from alternates: { canonical: ..., languages: { ... } }
    if (content.includes('languages: {') && content.includes('canonical:')) {
        content = content.replace(/languages:\s*\{\s*en:\s*`\$\{baseUrl\}\/en[^`]*`,\s*ur:\s*`\$\{baseUrl\}\/ur[^`]*`,\s*"x-default":\s*`\$\{baseUrl\}\/en[^`]*`,\s*\}/g, '');
        changed = true;
    }

    // Replace canonical: `${baseUrl}/${locale}/about` -> canonical: `${baseUrl}/about`
    if (content.includes('canonical: `${baseUrl}/${locale}')) {
        content = content.replace(/canonical:\s*`\$\{baseUrl\}\/\$\{locale\}([^`]*)`/g, 'canonical: `${baseUrl}$1`');
        changed = true;
    }

    // Replace url: `${baseUrl}/${locale}/about` -> url: `${baseUrl}/about` in openGraph
    if (content.includes('url: `${baseUrl}/${locale}')) {
        content = content.replace(/url:\s*`\$\{baseUrl\}\/\$\{locale\}([^`]*)`/g, 'url: `${baseUrl}$1`');
        changed = true;
    }
    
    if (content.includes('generateMetadata({ params }: { params: Promise<{ id: string, locale: string }> })')) {
        content = content.replace(/generateMetadata\(\{\s*params\s*\}\s*:\s*\{\s*params:\s*Promise<\{\s*id:\s*string,\s*locale:\s*string\s*\}>\s*\}\)/g, 'generateMetadata({ params }: { params: Promise<{ id: string }> })');
        changed = true;
    }
    
    if (content.includes('generateMetadata({ params }: { params: Promise<{ slug: string, locale: string }> })')) {
        content = content.replace(/generateMetadata\(\{\s*params\s*\}\s*:\s*\{\s*params:\s*Promise<\{\s*slug:\s*string,\s*locale:\s*string\s*\}>\s*\}\)/g, 'generateMetadata({ params }: { params: Promise<{ slug: string }> })');
        changed = true;
    }
    
    // Any other { params }: { params: Promise<{ ... }> } that has locale inside.
    if (content.match(/generateMetadata\(\{.*\}\)/) && content.includes('locale: string')) {
        content = content.replace(/,\s*locale:\s*string/, '');
        content = content.replace(/locale:\s*string\s*,/, '');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
}
