const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const fragmentDirectory = path.join(projectRoot, 'src', 'html');
const outputPath = path.join(projectRoot, 'index.html');
const assetManifestPath = path.join(projectRoot, 'asset-manifest.json');
const fragmentManifestPath = path.join(projectRoot, 'html-fragments.json');
const scriptManifestPath = path.join(projectRoot, 'modules', 'bootstrap', 'html-fragment-manifest.js');
const generatedFragmentDirectory = path.join(projectRoot, 'generated', 'html-fragments');

const fragments = [
  'document-head.html',
  'intro-and-home.html',
  'health-and-couple.html',
  'cphone.html',
  'myphone.html',
  'worldbook-and-presets.html',
  'api-settings-core.html',
  'api-settings-providers.html',
  'api-settings-data.html',
  'data-and-social-list.html',
  'chat-interface.html',
  'appearance-and-thoughts.html',
  'calls-and-social.html',
  'chat-settings-main.html',
  'chat-settings-extra.html',
  'feature-screens.html',
  'modals-general.html',
  'modals-feature.html',
  'modals-phone-and-finance.html',
  'online-and-myphone-modals.html',
  'games-and-document-tail.html'
];

const generatedHtml = fragments
  .map(fragment => fs.readFileSync(path.join(fragmentDirectory, fragment), 'utf8'))
  .join('');

const fragmentScripts = fragments.map(fragment => ({
  outputName: fragment.replace(/\.html$/, '.js'),
  source: fs.readFileSync(path.join(fragmentDirectory, fragment), 'utf8')
}));

const fragmentScriptPaths = fragmentScripts.map(
  fragment => `generated/html-fragments/${fragment.outputName}`
);

const embeddedAssets = [
  'archive/330--main/index.html'
];

const generatedFragmentScripts = fragmentScripts.map(fragment => ({
  ...fragment,
  contents: `window.__EPHONE_HTML_PARTS.push(${JSON.stringify(fragment.source)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')});\n`
}));

const generatedScriptManifest = `window.__EPHONE_HTML_FRAGMENT_SCRIPTS = ${JSON.stringify(
  fragmentScriptPaths,
  null,
  2
)};\n`;

// 启动期直接前置的全部 CSS（与 src/html/document-head.html 中 <head> 内的 <link> 保持同步）。
// 这样浏览器解析 index.html 时就并行开始下载 CSS，消除了原本「白屏 → 样式生效」的闪烁。
const PRELOAD_CSS_LINKS = [
  'css/base.css?v=0.0.36',
  'css/chat-ui.css?v=0.0.36',
  'css/image-nai.css?v=0.0.36',
  'css/memory.css?v=0.0.36',
  'css/media/music-player.css?v=0.0.36',
  'css/media/music-settings-and-groups.css?v=0.0.36',
  'css/video-voice-call.css?v=0.0.36',
  'css/settings-font.css?v=0.0.36',
  'css/core/feedback-and-chat.css?v=0.0.36',
  'css/chat/content-and-settings.css?v=0.0.36',
  'css/ui/search-and-character-apps.css?v=0.0.36',
  'css/phone/character-details.css?v=0.0.36',
  'css/ui/home-and-voice.css?v=0.0.36',
  'css/voice-recording.css?v=0.0.36',
  'css/phone/frame-and-minimal-chat.css?v=0.0.36',
  'css/media/nai-gallery.css?v=0.0.36',
  'css/chat/settings.css?v=0.0.36',
  'css/settings/ios-controls.css?v=0.0.36',
  'css/media/reading-and-home.css?v=0.0.36',
  'css/finance/alipay.css?v=0.0.36',
  'css/finance/funds.css?v=0.0.36',
  'css/chat/message-actions.css?v=0.0.36',
  'css/finance/alipay-modern.css?v=0.0.36',
  'css/finance/auction.css?v=0.0.36',
  'css/todo/todo-list.css?v=0.0.36',
  'css/social/green-river.css?v=0.0.36',
  'css/mail/mail-app.css?v=0.0.36',
  'css/chat/rendering-and-images.css?v=0.0.36',
  'css/social/green-river-comments.css?v=0.0.36',
  'css/social/reddit.css?v=0.0.36',
  'css/components/toast.css?v=0.0.36',
  'css/settings/layout.css?v=0.0.36',
  'css/phone/cphone-browser.css?v=0.0.36',
  'css/phone/cphone-notes.css?v=0.0.36',
  'css/phone/cphone-layout.css?v=0.0.36',
  'css/phone/cphone-layout-details.css?v=0.0.36',
  'css/phone/cphone-layout-adjustments.css?v=0.0.36',
  'css/phone/cphone-unified.css?v=0.0.36',
  'css/phone/cphone-polish.css?v=0.0.36',
  'css/chat/quick-replies-and-exclusions.css?v=0.0.36',
  'css/media/watch-together.css?v=0.0.36',
  'css/games/truth-game.css?v=0.0.36',
  'css/games/draw-and-guess.css?v=0.0.36',
  'css/tools/mobile-console.css?v=0.0.36',
  'css/media/voice-confirmation.css?v=0.0.36',
  'css/settings/prompt-manager.css?v=0.0.36',
  'css/ui/profile-page.css?v=0.0.36',
  'css/ui/profile-plate.css?v=0.0.36',
  'css/ui/profile-extras.css?v=0.0.36',
  'css/douban.css?v=0.0.36',
  'css/douban-menu.css?v=0.0.36',
  'update-notification.css?v=0.0.36',
  'css/memory/structured-memory.css?v=0.0.36',
  'css/memory/vector-memory.css?v=0.0.36',
  'css/online/app.css?v=0.0.36',
  'css/mcp/app.css?v=0.0.36',
  'css/health/period-tracker.css?v=0.0.36',
  'css/productivity/focus-timer.css?v=0.0.36',
  'css/core/extra.css?v=0.0.36',
  'css/keep-alive-player.css?v=0.0.36',
  'css/auth-intro.css?v=0.0.36',
  'css/clean-chat-detail.css?v=0.0.36',
  'css/clean-api-settings.css?v=0.0.36',
  'css/couple-invite.css?v=0.0.36',
  'css/floating-ball.css?v=0.0.36'
];

const generatedShell = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>EPhone</title>
  <meta name="theme-color" content="#000000">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="EPhone">
  <link rel="manifest" href="manifest.json?v=0.0.36-pwa2">
  <link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
  <link rel="apple-touch-icon" href="icons/icon-192.png">
${PRELOAD_CSS_LINKS.map(href => `  <link rel="stylesheet" href="${href}">`).join('\n')}
  <script src="modules/bootstrap/register-service-worker.js"></script>
</head>
<body>
  <noscript>此应用需要启用 JavaScript。</noscript>
  <script src="modules/bootstrap/html-fragment-manifest.js"></script>
  <script src="modules/bootstrap/document-loader.js"></script>
</body>
</html>
`;

const generatedFragmentManifest = `${JSON.stringify(fragments, null, 2)}\n`;

const localAssets = Array.from(
  generatedHtml.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/gi),
  match => match[1]
)
  .filter(asset => !/^(?:https?:)?\/\//i.test(asset))
  .map(asset => asset.replace(/^\.\//, '').split(/[?#]/, 1)[0])
  .filter(Boolean);

const generatedAssetManifest = `${JSON.stringify(
  Array.from(new Set([
    'index.html',
    'manifest.json',
    'sw.js',
    'html-fragments.json',
    'modules/bootstrap/register-service-worker.js',
    'modules/bootstrap/html-fragment-manifest.js',
    'modules/bootstrap/document-loader.js',
    ...fragmentScriptPaths,
    ...embeddedAssets,
    ...localAssets
  ])),
  null,
  2
)}\n`;

if (process.argv.includes('--check')) {
  const currentHtml = fs.readFileSync(outputPath, 'utf8');
  if (currentHtml !== generatedShell) {
    console.error('index.html is out of sync with the generated document shell.');
    process.exit(1);
  }
  if (fs.readFileSync(fragmentManifestPath, 'utf8') !== generatedFragmentManifest) {
    console.error('html-fragments.json is out of sync with the fragment order.');
    process.exit(1);
  }
  if (fs.readFileSync(scriptManifestPath, 'utf8') !== generatedScriptManifest) {
    console.error('HTML fragment script manifest is out of sync with the fragment order.');
    process.exit(1);
  }
  for (const fragment of generatedFragmentScripts) {
    const output = path.join(generatedFragmentDirectory, fragment.outputName);
    if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== fragment.contents) {
      console.error(`${fragment.outputName} is out of sync with its HTML source fragment.`);
      process.exit(1);
    }
  }
  const currentAssetManifest = fs.readFileSync(assetManifestPath, 'utf8');
  if (currentAssetManifest !== generatedAssetManifest) {
    console.error('asset-manifest.json is out of sync with index.html.');
    process.exit(1);
  }
  console.log(`Document shell and ${fragments.length} HTML fragments verified.`);
} else {
  fs.mkdirSync(generatedFragmentDirectory, { recursive: true });
  fs.writeFileSync(outputPath, generatedShell);
  fs.writeFileSync(fragmentManifestPath, generatedFragmentManifest);
  fs.writeFileSync(scriptManifestPath, generatedScriptManifest);
  for (const fragment of generatedFragmentScripts) {
    fs.writeFileSync(
      path.join(generatedFragmentDirectory, fragment.outputName),
      fragment.contents
    );
  }
  fs.writeFileSync(assetManifestPath, generatedAssetManifest);
  console.log(`Document shell and local scripts generated for ${fragments.length} HTML fragments.`);
}
