import { env } from '../../config';

export interface UploadedCloudinaryMedia {
  url: string;
  kind: 'image' | 'video';
}

export const uploadMediaToCloudinary = async (
  uri: string,
  type: string,
  filename: string
): Promise<UploadedCloudinaryMedia> => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      type: type,
      name: filename,
    } as any);
    formData.append('upload_preset', env.uploadPreset);

    const response = await fetch(env.cloudinaryUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Lỗi khi tải lên Cloudinary');
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      kind: type.startsWith('video/') ? 'video' : 'image',
    };
  } catch (error: any) {
    console.error('[CloudinaryUpload] Error:', error);
    throw new Error(error.message || 'Lỗi khi tải ảnh/video lên.');
  }
};
