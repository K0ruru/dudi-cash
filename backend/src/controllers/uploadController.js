import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadImage = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const image = req.files.image;
    const fileName = `product_${Date.now()}${path.extname(image.name)}`;
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../public/uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    
    const uploadPath = path.join(uploadDir, fileName);
    await image.mv(uploadPath);

    // Return the full URL
    res.json({
      path: `http://localhost:7070/uploads/${fileName}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
}; 