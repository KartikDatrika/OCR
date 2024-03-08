import fs from "fs";
import { createCanvas, loadImage } from "canvas";
import { getFileNameWithoutExtension } from "./helpers.js";

// Function to split image into vertical halves
async function splitImageVertical(imagePath, outputDir) {
  const name = getFileNameWithoutExtension(imagePath);
  console.log(name);
  try {
    // Load image
    const img = await loadImage(imagePath);
    const width = img.width;
    const height = img.height;

    // Create canvas
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");

    // Draw original image on canvas
    context.drawImage(img, 0, 0);

    // Create imageData object for left half
    const leftImageData = context.getImageData(0, 0, width / 2, height);
    const leftCanvas = createCanvas(width / 2, height);
    const leftContext = leftCanvas.getContext("2d");
    leftContext.putImageData(leftImageData, 0, 0);

    // Save left half as new image
    const leftImagePath = `${outputDir}/${name}_left.png`;
    const leftFileStream = fs.createWriteStream(leftImagePath);
    leftFileStream.write(leftCanvas.toBuffer("image/png"));
    leftFileStream.end();
    console.log(`Left half saved as ${leftImagePath}`);

    // Create imageData object for right half
    const rightImageData = context.getImageData(
      width / 2,
      0,
      width / 2,
      height
    );
    const rightCanvas = createCanvas(width / 2, height);
    const rightContext = rightCanvas.getContext("2d");
    rightContext.putImageData(rightImageData, 0, 0);

    // Save right half as new image
    const rightImagePath = `${outputDir}/${name}_right.png`;
    const rightFileStream = fs.createWriteStream(rightImagePath);
    rightFileStream.write(rightCanvas.toBuffer("image/png"));
    rightFileStream.end();
    console.log(`Right half saved as ${rightImagePath}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Path to the directory containing images
const inputDir = "../data/imgs";

// Output directory for split images
const outputDir = "../data/splitImgs";
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read each image in the folder and split into vertical halves
fs.readdir(inputDir, async (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  for (const file of files) {
    const imagePath = `${inputDir}/${file}`;
    await splitImageVertical(imagePath, outputDir);
  }
});
