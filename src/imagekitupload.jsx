import React from 'react'

// export const Imagekitupload = async(file) => {
//   const formData = new FormData();

//   formData.append('file',file);
//   formData.append('filename', file.name);
//   formData.append('publicKey', process.env.REACT_APP_IMAGEKIT_PUBLIC_KEY);

//   const res = await fetch(process.env.REACT_APP_IMAGEKIT_UPLOAD_ENDPOINT , {
//     method: 'POST',
//     body: formData,
//   });

//     if (!res.ok) {
//         throw new Error('Image upload failed mf');
//     }

//     const data = await res.json();
//     return data.url;
// }

export const Imagekitupload = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  formData.append("publicKey", process.env.REACT_APP_IMAGEKIT_PUBLIC_KEY);
  formData.append("uploadPreset", process.env.REACT_APP_IMAGEKIT_UPLOAD_PRESET);


  const res = await fetch(process.env.REACT_APP_IMAGEKIT_UPLOAD_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
      throw new Error('Image upload failed mf');
  }

  const data = await res.json();
  return { url: data.url, fileId: data.fileId };
};