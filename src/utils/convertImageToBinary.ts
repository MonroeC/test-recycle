import fs from 'fs'

function convertImageToBinary(imagePath) {
  try {
    const buffer = fs.createReadStream(imagePath)
    return buffer
  } catch (error) {
    console.log(error, 'error')
  }
}
export default convertImageToBinary
