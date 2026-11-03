import sharp from "sharp";
import { readdir, mkdir, stat, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "resources", "js", "assets");
const outputRoot = path.join(root, "public", "images", "optimized");
const manifestPath = path.join(root, "resources", "js", "generated", "imageVariants.ts");
const sourceExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg"]);
const renditionWidths = [320, 480, 640, 960, 1280, 1600, 1920, 2560];

function sourceStem(relativePath) {
  return path.join(
    path.dirname(relativePath),
    path.basename(relativePath, path.extname(relativePath)),
  ).toLowerCase();
}

function maxDisplayWidth(relativePath) {
  if (/^Hero[\\/]/i.test(relativePath)) return 1280;
  if (/^portfolio-/i.test(relativePath)) return 800;
  if (/^logo[\\/]/i.test(relativePath)) return 320;
  if (/^og-image\./i.test(relativePath)) return 1200;
  return 1200;
}

async function findImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findImages(fullPath));
    } else if (sourceExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

async function optimizedBuffer(sourcePath, width, format) {
  const image = sharp(sourcePath).rotate().resize({
    width,
    withoutEnlargement: true,
  });

  return format === "avif"
    ? image.avif({ quality: 50, effort: 5 }).toBuffer()
    : image.webp({ quality: 80, effort: 5 }).toBuffer();
}

const sources = (await findImages(sourceRoot)).sort();
const sourceStemCounts = new Map();
for (const sourcePath of sources) {
  const stem = sourceStem(path.relative(sourceRoot, sourcePath));
  sourceStemCounts.set(stem, (sourceStemCounts.get(stem) || 0) + 1);
}

const previousOutputPaths = new Set();
try {
  const previousManifest = await readFile(manifestPath, "utf8");
  const variantsMatch = previousManifest.match(
    /export const imageVariants: Record<string, ResponsiveImageVariant> = (\{[\s\S]*\});\s*$/,
  );
  if (!variantsMatch) {
    throw new Error(`Could not parse generated image manifest at ${manifestPath}`);
  }

  const previousVariants = JSON.parse(variantsMatch[1]);
  for (const variant of Object.values(previousVariants)) {
    const urls = [
      variant.src,
      ...variant.webpSrcSet.split(",").map((entry) => entry.trim().split(/\s+/)[0]),
      ...variant.avifSrcSet.split(",").map((entry) => entry.trim().split(/\s+/)[0]),
    ];
    for (const url of urls) {
      const prefix = "/images/optimized/";
      if (!url.startsWith(prefix)) {
        throw new Error(`Unexpected generated image URL in manifest: ${url}`);
      }
      previousOutputPaths.add(path.resolve(outputRoot, url.slice(prefix.length).split("/").join(path.sep)));
    }
  }
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const variants = {};
const currentOutputPaths = new Set();
let sourceBytes = 0;
let responsiveBytes = 0;
let largestWebpBytes = 0;
let largestAvifBytes = 0;

for (const sourcePath of sources) {
  const relativePath = path.relative(sourceRoot, sourcePath);
  const normalizedPath = relativePath.split(path.sep).join("/");
  const metadata = await sharp(sourcePath).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Image dimensions are missing for ${normalizedPath}`);
  }

  const sourceStat = await stat(sourcePath);
  sourceBytes += sourceStat.size;
  const limit = Math.min(metadata.width, maxDisplayWidth(relativePath));
  const extension = path.extname(relativePath).slice(1).toLowerCase();
  const sourceName = path.basename(relativePath, path.extname(relativePath));
  const outputName = sourceStemCounts.get(sourceStem(relativePath)) > 1
    ? `${sourceName}-${extension}`
    : sourceName;
  const widths = [...new Set([
    ...renditionWidths.filter((width) => width < limit),
    limit,
  ])].sort((a, b) => a - b);
  const formats = { avif: [], webp: [] };
  let finalDimensions;

  for (const width of widths) {
    const outputWidth = Math.min(width, metadata.width);
    const outputHeight = Math.round(metadata.height * outputWidth / metadata.width);
    const outputRelative = path.join(
      path.dirname(relativePath),
      `${outputName}-${outputWidth}`,
    );
    for (const format of ["avif", "webp"]) {
      const outputPath = path.join(outputRoot, `${outputRelative}.${format}`);
      currentOutputPaths.add(path.resolve(outputPath));
      await mkdir(path.dirname(outputPath), { recursive: true });

      let outputStat;
      try {
        outputStat = await stat(outputPath);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
        outputStat = null;
      }

      if (!outputStat || outputStat.mtimeMs < sourceStat.mtimeMs) {
        const buffer = await optimizedBuffer(sourcePath, outputWidth, format);
        await writeFile(outputPath, buffer);
        outputStat = await stat(outputPath);
      }

      responsiveBytes += outputStat.size;
      if (width === widths.at(-1)) {
        if (format === "webp") largestWebpBytes += outputStat.size;
        else largestAvifBytes += outputStat.size;
      }

      formats[format].push(`/images/optimized/${outputRelative.split(path.sep).join("/")}.${format} ${outputWidth}w`);
    }

    finalDimensions = { width: outputWidth, height: outputHeight };
  }

  const largestWidth = widths.at(-1);
  const outputBase = path.join(
    path.dirname(relativePath),
    `${outputName}-${largestWidth}`,
  ).split(path.sep).join("/");

  variants[normalizedPath] = {
    src: `/images/optimized/${outputBase}.webp`,
    width: finalDimensions.width,
    height: finalDimensions.height,
    webpSrcSet: formats.webp.join(", "),
    avifSrcSet: formats.avif.join(", "),
  };
}

await mkdir(path.dirname(manifestPath), { recursive: true });
await writeFile(
  manifestPath,
  `export type ResponsiveImageVariant = { src: string; width: number; height: number; webpSrcSet: string; avifSrcSet: string };\n` +
    `export const imageVariants: Record<string, ResponsiveImageVariant> = ${JSON.stringify(variants, null, 2)};\n`,
);

for (const outputPath of previousOutputPaths) {
  if (currentOutputPaths.has(outputPath)) continue;
  try {
    await unlink(outputPath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

const reduction = (bytes) => `${((1 - bytes / sourceBytes) * 100).toFixed(1)}%`;
console.log(`Images processed: ${sources.length}`);
console.log(`Originals: ${(sourceBytes / 1024 / 1024).toFixed(2)} MiB`);
console.log(`Largest WebP rendition estimate: ${(largestWebpBytes / 1024 / 1024).toFixed(2)} MiB (${reduction(largestWebpBytes)} smaller)`);
console.log(`Largest AVIF rendition estimate: ${(largestAvifBytes / 1024 / 1024).toFixed(2)} MiB (${reduction(largestAvifBytes)} smaller)`);
console.log(`All responsive variants: ${(responsiveBytes / 1024 / 1024).toFixed(2)} MiB`);
