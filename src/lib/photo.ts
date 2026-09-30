/* Photos are decoded and re-encoded locally so the upload has a bounded size and no EXIF metadata. */
export async function preparePhoto(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("JPG, PNG, WEBP 사진을 선택해 주세요.");
  if (file.size > 15 * 1024 * 1024) throw new Error("15MB 이하의 사진을 선택해 주세요.");
  const source = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = source;
    await image.decode().catch(() => { throw new Error("사진을 열 수 없습니다. 다른 파일을 선택해 주세요."); });
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 60000000) throw new Error("사진의 크기가 너무 큽니다. 크기를 줄여서 다시 올려 주세요.");
    for (const side of [1280, 960, 720, 480]) {
      const scale = Math.min(1, side / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("이 브라우저에서 사진을 처리할 수 없습니다.");
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.82, 0.68, 0.5]) {
        const result = canvas.toDataURL("image/jpeg", quality);
        if (result.length <= 440000) return result;
      }
    }
    throw new Error("사진 크기를 줄이지 못했습니다. 다른 사진을 선택해 주세요.");
  } finally { URL.revokeObjectURL(source); }
}
