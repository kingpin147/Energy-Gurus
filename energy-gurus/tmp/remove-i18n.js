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

    // 1. Remove next-intl imports
    if (content.includes('next-intl')) {
        content = content.replace(/import\s+\{.*\}\s+from\s+['"]next-intl.*['"];?\n?/g, '');
        content = content.replace(/import\s+NextIntlClientProvider\s+from\s+['"]next-intl.*['"];?\n?/g, '');
        changed = true;
    }

    // 2. Replace @/i18n/routing imports
    if (content.includes('@/i18n/routing')) {
        const importMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]@\/i18n\/routing['"];?/);
        if (importMatch) {
            const imports = importMatch[1].split(',').map(s => s.trim());
            let newImports = [];
            
            if (imports.includes('Link')) {
                newImports.push(`import Link from "next/link";`);
            }
            
            const navImports = imports.filter(i => i !== 'Link' && i !== 'redirect');
            if (navImports.length > 0) {
                newImports.push(`import { ${navImports.join(', ')} } from "next/navigation";`);
            }
            
            if (imports.includes('redirect')) {
                newImports.push(`import { redirect } from "next/navigation";`);
            }

            content = content.replace(importMatch[0], newImports.join('\n'));
            changed = true;
        }
    }
    
    // 3. Remove NextIntlClientProvider usage
    if (content.includes('NextIntlClientProvider')) {
        content = content.replace(/<NextIntlClientProvider[^>]*>/g, '');
        content = content.replace(/<\/NextIntlClientProvider>/g, '');
        changed = true;
    }

    // 4. Clean up useLocale, getTranslations, useTranslations usages (since they are removed from imports)
    if (content.includes('useLocale()')) {
        content = content.replace(/const\s+locale\s*=\s*useLocale\(\);?/g, 'const locale = "en";');
        changed = true;
    }
    if (content.includes('useTranslations(')) {
        content = content.replace(/const\s+t\s*=\s*useTranslations\([^)]*\);?/g, '');
        changed = true;
    }
    if (content.includes('getTranslations(')) {
        content = content.replace(/const\s+t\s*=\s*await\s+getTranslations\([^)]*\);?/g, '');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
}
