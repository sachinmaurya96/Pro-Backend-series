import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary\
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });
    //file has been uploaded succesfully
    fs.unlinkSync(localFilePath)
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload operation got failed
    return null
  }
};

const deleateOnCloudinary = async (public_id,type="image")=>{
  try {
    if(!public_id) return null
    await cloudinary.uploader.destroy(public_id,{ resource_type: type },  function(result) { console.log(result) });
    console.log("file deleted successfully")
  } catch (error) {
    console.log(error?.message)
  }

}
export {uploadOnCloudinary,deleateOnCloudinary}