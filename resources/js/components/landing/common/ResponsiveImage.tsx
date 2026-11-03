import { forwardRef, type ImgHTMLAttributes } from "react";
import { imageVariants } from "@/generated/imageVariants";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  source: string;
  sizes?: string;
};

export const ResponsiveImage = forwardRef<HTMLImageElement, Props>(function ResponsiveImage(
  { source, sizes = "100vw", ...imageProps },
  ref,
) {
  const variant = imageVariants[source];

  if (!variant) {
    return <img ref={ref} src={source} sizes={sizes} {...imageProps} />;
  }

  return (
    <picture className="block h-full w-full">
      <source type="image/avif" srcSet={variant.avifSrcSet} sizes={sizes} />
      <source type="image/webp" srcSet={variant.webpSrcSet} sizes={sizes} />
      <img
        src={variant.src}
        width={imageProps.width ?? variant.width}
        height={imageProps.height ?? variant.height}
        sizes={sizes}
        ref={ref}
        {...imageProps}
      />
    </picture>
  );
});
