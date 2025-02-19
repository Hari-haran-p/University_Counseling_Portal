import axios from 'axios';

export async function uploadFiles(photo, signature, declaration, originalPhotoUrl, originalSignatureUrl) {
  try {
    let photoBase64 = null;
    if (photo) {
      photoBase64 = await fileToBase64(photo);
    } else {
      photoBase64 = originalPhotoUrl
    }

    let signatureBase64 = null;
    if (signature) {
      signatureBase64 = await fileToBase64(signature);
    } else {
      signatureBase64 = originalSignatureUrl
    }

    const response = await axios.post('/api/declarationDetails', {
      photo: photoBase64,
      signature: signatureBase64,
      declaration: declaration
    });

    return response;
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
}

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};