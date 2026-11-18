// `cap sync` copies EVERYTHING from dist/ (including public/) into the Android
// app assets. Since we host DRIFTLENS-Q.apk in public/ for phone downloads, the
// sync would otherwise embed the APK inside itself (+7.3 MB, pointless).
// Run automatically via `npm run sync:android`.
const { rmSync } = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'android',
  'app',
  'src',
  'main',
  'assets',
  'public',
  'DRIFTLENS-Q.apk'
);

try {
  rmSync(target, { force: true });
  console.log('[strip-apk] removed hosted APK from Android assets:', target);
} catch (err) {
  console.warn('[strip-apk] could not remove:', err.message);
}
