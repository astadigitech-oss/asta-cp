import { forwardRef, type ImgHTMLAttributes } from "react";
import { imageVariants } from "@/generated/imageVariants";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  source: string;
  sizes?: string;
};

function sanitizeSrcSet(srcSet?: string): string | undefined {
  if (!srcSet) return undefined;
  return srcSet
    .split(",")
    .map((candidate) => {
      const trimmed = candidate.trim();
      const lastSpaceIndex = trimmed.lastIndexOf(" ");
      if (lastSpaceIndex === -1) {
        return encodeURI(trimmed);
      }
      const urlPart = trimmed.substring(0, lastSpaceIndex).trim();
      const descriptor = trimmed.substring(lastSpaceIndex + 1).trim();
      return `${encodeURI(urlPart)} ${descriptor}`;
    })
    .join(", ");
}

function resolveSourceUrl(src?: string): string | undefined {
  if (!src) return src;
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/") ||
    src.startsWith("data:")
  ) {
    return src;
  }
  if (src.startsWith("storage/")) {
    return `/${src}`;
  }
  if (src.startsWith("images/")) {
    return `/storage/${src}`;
  }
  return `/${src}`;
}

export const ResponsiveImage = forwardRef<HTMLImageElement, Props>(function ResponsiveImage(
  { source, sizes = "100vw", loading = "lazy", decoding = "async", ...imageProps },
  ref,
) {
  const variant = imageVariants[source];

  if (!variant) {
    const resolved = resolveSourceUrl(source);
    return (
      <img
        ref={ref}
        src={resolved ? encodeURI(resolved) : source}
        sizes={sizes}
        loading={loading}
        decoding={decoding}
        {...imageProps}
      />
    );
  }

  return (
    <picture className="block h-full w-full">
      <source type="image/avif" srcSet={sanitizeSrcSet(variant.avifSrcSet)} sizes={sizes} />
      <source type="image/webp" srcSet={sanitizeSrcSet(variant.webpSrcSet)} sizes={sizes} />
      <img
        src={encodeURI(variant.src)}
        width={imageProps.width ?? variant.width}
        height={imageProps.height ?? variant.height}
        sizes={sizes}
        ref={ref}
        loading={loading}
        decoding={decoding}
        {...imageProps}
      />
    </picture>
  );
});
