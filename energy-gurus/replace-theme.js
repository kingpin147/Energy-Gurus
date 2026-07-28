const fs = require('fs');
const p = require('path');

const replacements = [
    { regex: /\bbg-primary\/(\d+)\b/g, replace: 'bg-amber/$1 text-ink' },
    { regex: /\bbg-primary\b/g, replace: 'bg-amber text-ink' },
    { regex: /\btext-primary-foreground\b/g, replace: 'text-ink' },
    { regex: /\btext-primary\/(\d+)\b/g, replace: 'text-amber/$1' },
    { regex: /\btext-primary\b/g, replace: 'text-amber' },
    { regex: /\bborder-primary\/(\d+)\b/g, replace: 'border-amber/$1' },
    { regex: /\bborder-primary\b/g, replace: 'border-amber' },
    
    { regex: /\bbg-secondary\/(\d+)\b/g, replace: 'bg-paper/$1' },
    { regex: /\bbg-secondary\b/g, replace: 'bg-paper' },
    { regex: /\btext-secondary-foreground\b/g, replace: 'text-slate-custom' },
    { regex: /\btext-secondary\b/g, replace: 'text-slate-custom' },
    { regex: /\bborder-secondary\/(\d+)\b/g, replace: 'border-paper/$1' },
    { regex: /\bborder-secondary\b/g, replace: 'border-paper' },

    { regex: /\btext-muted-foreground\b/g, replace: 'text-slate-custom' },
    { regex: /\btext-muted\b/g, replace: 'text-slate-custom' },
    { regex: /\bbg-muted\b/g, replace: 'bg-paper' },

    { regex: /\bborder-border\/(\d+)\b/g, replace: 'border-line/$1' },
    { regex: /\bborder-border\b/g, replace: 'border-line' },

    { regex: /\bbg-card\b/g, replace: 'bg-white' },
    { regex: /\btext-card-foreground\b/g, replace: 'text-ink' },
    
    { regex: /\bbg-background\b/g, replace: 'bg-paper' },
    { regex: /\btext-foreground\b/g, replace: 'text-graphite' },

    { regex: /\bbg-accent\b/g, replace: 'bg-paper' },
    { regex: /\btext-accent-foreground\b/g, replace: 'text-ink' },
    { regex: /\btext-accent\b/g, replace: 'text-amber' }
];

function processDir(d) {
    const files = fs.readdirSync(d);
    for (const f of files) {
        const fullPath = p.join(d, f);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            for (const r of replacements) {
                content = content.replace(r.regex, r.replace);
            }
            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated: ' + fullPath);
            }
        }
    }
}

processDir('src');
