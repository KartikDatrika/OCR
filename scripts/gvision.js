// Imports the Google Cloud client library
import vision from "@google-cloud/vision";
import {
  readFolder,
  convertToExcel,
  getFileNameWithoutExtension,
} from "./helpers.js";

// Creates a client
const client = new vision.ImageAnnotatorClient({
  keyFilename: "../secureKeys/pdf-to-text-conversion-416404-823fab80fa5a.json",
});

async function quickstart(f, path) {
  const name = getFileNameWithoutExtension(path);
  const [result] = await client.documentTextDetection(path);
  const fullTextAnnotation = result.fullTextAnnotation;
  // console.log(fullTextAnnotation.text);
  convertToExcel(fullTextAnnotation.text.split("\n"), "../data/tns/" + name);
}

readFolder("../data/splitImgs", quickstart);
// quickstart("", "./right_half.jpg");
// quickstart("", "../data/splitImgs/left_2.png");
// convertToExcel();
// fs.writeFile(
//   "../data/tns/left.txt",
//   fullTextAnnotation.text.split("\n").length,
//   function (error) {
//     if (error) {
//       console.error("Error: " + error);
//     }
//   }
// );
// fullTextAnnotation.pages.forEach((page) => {
//   page.blocks.map((block) =>
//     block.paragraphs.map((para) =>
//       para.words.map((word) =>
//         word.symbols.map((sym) => console.log(sym.text, sym.boundingBox))
//       )
//     )
//   );
// });
// Performs label detection on the image file
// const [result] = await client.labelDetection("./data/pdfs/pdf.pdf");
// console.log("hii11");
// const labels = result.labelAnnotations;
// labels.forEach((label) => console.log(label.description));
