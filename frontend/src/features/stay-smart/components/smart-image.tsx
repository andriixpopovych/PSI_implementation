import type { ImgHTMLAttributes, SyntheticEvent } from "react";

import { getDemoImageFallback } from "../lib/media";

type SmartImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

export function SmartImage({
  src,
  alt,
  fallbackSrc = getDemoImageFallback(),
  onError,
  ...props
}: SmartImageProps) {
  const resolvedSrc = typeof src === "string" && src.trim().length > 0 ? src : fallbackSrc;

  const handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    const image = event.currentTarget;

    if (image.src !== fallbackSrc) {
      image.src = fallbackSrc;
    }

    onError?.(event);
  };

  return (
    <img
      {...props}
      src={resolvedSrc}
      alt={alt}
      loading={props.loading ?? "lazy"}
      referrerPolicy={props.referrerPolicy ?? "no-referrer"}
      onError={handleError}
    />
  );
}
