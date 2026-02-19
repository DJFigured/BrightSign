const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const glob = execSync(
  'find node_modules/.pnpm -path "*/@tailwindcss/node/dist/index.js" 2>/dev/null',
  { cwd: path.join(__dirname, '..'), encoding: 'utf8' }
).trim().split('\n').filter(Boolean);

for (const file of glob) {
  const filePath = path.join(__dirname, '..', file);
  console.log('Patching:', filePath);

  let code = fs.readFileSync(filePath, 'utf8');

  // In pnpm, enhanced-resolve is a sibling under the .pnpm virtual store
  // e.g., .pnpm/@tailwindcss+node@4.1.8/node_modules/enhanced-resolve/
  const pnpmNodeModules = path.resolve(path.dirname(filePath), '..', '..', 'node_modules');
  let erDir = path.join(pnpmNodeModules, 'enhanced-resolve');

  if (!fs.existsSync(erDir)) {
    // Try resolve from the file's directory
    try {
      erDir = path.dirname(require.resolve('enhanced-resolve/package.json', { paths: [pnpmNodeModules] }));
    } catch {
      // Fallback: use the root node_modules enhanced-resolve
      try {
        erDir = path.dirname(require.resolve('enhanced-resolve/package.json'));
      } catch {
        console.log('  ERROR: Cannot find enhanced-resolve');
        continue;
      }
    }
  }

  const erIndexPath = path.join(erDir, 'lib', 'index.js').replace(/\\/g, '/');
  console.log('  enhanced-resolve at:', erIndexPath);

  // Replace require("enhanced-resolve") with a Module.createRequire call
  // This bypasses Next.js's require hook
  const preamble = `var __ER_REQUIRE__=require("module").createRequire("${erIndexPath}");`;
  code = preamble + code.replace(
    /require\("enhanced-resolve"\)/g,
    `__ER_REQUIRE__("${erIndexPath}")`
  );

  // Fix .default interop (enhanced-resolve is CJS, exports directly)
  code = code.replace(
    /(\b\w+)\.default\.(CachedInputFileSystem|ResolverFactory)/g,
    '$1.$2'
  );

  fs.writeFileSync(filePath, code);
  console.log('  Patched OK');
}

console.log('Patch complete');
