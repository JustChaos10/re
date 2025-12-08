import React, { useState } from 'react';
import clsx from 'clsx';
import { ImageComponent } from '@re/core';

export function Image({ props }: { props?: ImageComponent['props'] }) {
  const { src, alt = 'Image', width, height, rounded = false } =
    props ?? ({} as ImageComponent['props']);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div 
      className={clsx('re-image-container', rounded && 're-image-rounded')}
      style={{ width: width || '100%', height: height || 'auto', aspectRatio: width && height ? `${width}/${height}` : 'auto' }}
    >
      {isLoading && (
        <div className="re-image-skeleton" />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={clsx('re-image', isLoading ? 're-image-hidden' : 're-image-visible')}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        loading="lazy"
      />
      {hasError && (
        <div className="re-image-error">
          <span>Failed to load image</span>
        </div>
      )}
    </div>
  );
}
