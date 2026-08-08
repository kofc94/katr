/**
 * Client-side image compression utility
 * Resizes images to max 1200px dimension and compresses to ~200-300KB JPEG
 * for ultra-fast S3 uploads on mobile cellular data.
 */
export async function compressImage(file, maxDimension = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve(file); // Return original if not an image
      return;
    }

    const image = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      image.src = e.target.result;
    };

    image.onload = () => {
      let width = image.width;
      let height = image.height;

      // Maintain aspect ratio while scaling to maxDimension
      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas to Blob conversion failed'));
            return;
          }
          // Return compressed Blob with original filename format
          resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
            type: 'image/jpeg',
            lastModified: Date.now()
          }));
        },
        'image/jpeg',
        quality
      );
    };

    image.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
