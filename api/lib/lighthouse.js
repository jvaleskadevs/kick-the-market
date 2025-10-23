//import lighthouse from '@lighthouse-web3/sdk';
import { LIGHTHOUSE_URL } from "../config.js";

export async function uploadNftToIpfs(metadata) {
  //return "ipfs://placeholder/" + Math.floor(Math.random() * 123456790);
  if (!metadata || !metadata?.properties || !process.env.LIGHTHOUSE_API_KEY) return "";
  
  try {
    const imageUri = metadata.imageUri.replace("ipfs://", LIGHTHOUSE_URL);
    const formData = new FormData();
    const blob = new Blob([JSON.stringify({
      name: metadata.name,
      description: metadata.description,
      image: imageUri,
      content: {
        mime: "image/*",
        uri: imageUri
      },
      properties: metadata?.properties
    })], { type: 'application/json' }); 
    formData.append('file', blob, metadata.name + ".json");
    
    const response = await fetch('https://upload.lighthouse.storage/api/v0/add', {
        method: 'POST',
        body: formData,
        headers: {
          'Mime-Type': 'application/json',
          Authorization: `Bearer ${process.env.LIGHTHOUSE_API_KEY}`,
        },
        //signal: AbortSignal.timeout(5555)
    });
    
    const data = await response?.json();
    //console.log(data);
    
    return data?.Hash ? "ipfs://" + data.Hash : "";
  } catch (err) {
    console.log(err);
    console.log("Error Uploading to Lighthouse");
  }  
  
  return "";
}

export async function uploadImageToIpfs(image, name) {
  //return "ipfs://placeholder/image" + Math.floor(Math.random() * 123456790);
  if (!image || !name) return "";

  try {
    const imageEndpoint = image.startsWith("https://") || image.startsWith("data:image/png;base64,") || image.startsWith("data:image/svg+xml;base64,") ? image : `data:image/png;base64,${image}`;
    
    const imageResponse = await fetch(imageEndpoint);
    const blob = await imageResponse.blob();  

    const formData = new FormData();
    //const blob = new Blob([image], { type: 'image/png' }); 
    formData.append('file', blob, "img-" + name + "." + blob.type.substring(6));
    
    const response = await fetch('https://upload.lighthouse.storage/api/v0/add', {
      method: 'POST',
      body: formData,
      headers: {
        'Mime-Type': blob.type ?? 'image/*',
        Authorization: `Bearer ${process.env.LIGHTHOUSE_API_KEY}`,
      },
      //signal: AbortSignal.timeout(5555)
    });
    
    const data = await response?.json(); 
    //console.log(data);  

    return data?.Hash ? "ipfs://" + data.Hash : "";
  } catch (err) {
    console.log(err);
  }
  return "";
}
/*
export async function uploadVideoToIpfs(video, name) {
  if (!video || !name) return "";
  
  try {
    const videoResponse = await fetch(video);
    const blob = await videoResponse.blob();
    
    console.log(videoResponse);
    console.log(blob);

    const formData = new FormData();
    formData.append('file', blob, "video-" + name + ".m3u8");
    
    console.log(formData);

    const response = await fetch('https://node.lighthouse.storage/api/v0/add', {
      method: 'POST',
      body: formData,
      headers: {
        'Mime-Type': blob.type ?? 'application/x-mpegurl',
        Authorization: `Bearer ${process.env.LIGHTHOUSE_API_KEY}`,
      }
    });
    
    const data = await response?.json(); 
    //console.log(data);
  
    return data?.Hash ? "ipfs://" + data.Hash : "";
  } catch (err) {
    console.log(err);
  }  
  return "";
}
*/
