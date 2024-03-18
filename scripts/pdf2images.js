import fs from "fs";
import pdf2img from "pdf-img-convert";

// Path to the PDF file
const pdfPath = "../data/pdfs/ca.pdf";

var outputImages1 = pdf2img.convert(pdfPath);
outputImages1.then(function (outputImages) {
  for (var i = 0; i < outputImages.length; i++)
    fs.writeFile(
      "../data/imgs/" + (i + 1) + ".png",
      outputImages[i],
      function (error) {
        if (error) {
          console.error("Error: " + error);
        }
      }
    );
});
