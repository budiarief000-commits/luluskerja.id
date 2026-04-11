const fs = require('fs');
const html = fs.readFileSync('luluskerja.html.bak', 'utf8');

const extractAndSave = (regex, path, wrapper = '') => {
    const match = html.match(regex);
    if (match) {
        let content = wrapper.replace('CONTENT', match[1] || match[0]);
        // Astro components sometimes need `class` -> `class` is fine, but <input> must be self closing if error? In astro, standard HTML is completely fine!
        fs.writeFileSync(path, '---\n---\n\n' + content);
        console.log('Saved ' + path);
    } else {
        console.log('Missed ' + path);
    }
};

extractAndSave(/<nav class="nav-blur(.*?)<\/nav>/s, 'src/components/Header.astro', '<nav class="nav-blurCONTENT</nav>');
extractAndSave(/<div id="landing-page-content">(.*?)<footer/is, 'src/components/LandingContent.astro', '<div id="landing-page-content">\nCONTENT\n</div>');
extractAndSave(/<footer(.*?)<\/footer>/is, 'src/components/Footer.astro', '<footerCONTENT</footer>');
extractAndSave(/<div id="dashboard-view"(.*?)<script>/is, 'src/components/DashboardContent.astro', '<div id="dashboard-view"CONTENT</div>');
extractAndSave(/<div id="bundle-modal"(.*?)<div id="dashboard-view"/is, 'src/components/Modals.astro', '<div id="bundle-modal"CONTENT</div>');

// Extract script
const scriptMatch = html.match(/<script>\s*tailwind\.config.*?<\/script>.*?<script>(?:\s*lucide\.createIcons\(\);.*?)<\/script>/is);
if (scriptMatch) {
    // Actually we just want the second script block:
    const mainScriptMatch = html.split('<script>');
    for (let script of mainScriptMatch) {
        if (script.includes('lucide.createIcons();')) {
            let pureScript = script.split('</script>')[0];
            fs.writeFileSync('src/lib/mainLogic.js', pureScript);
            console.log('Saved src/lib/mainLogic.js');
            break;
        }
    }
}
