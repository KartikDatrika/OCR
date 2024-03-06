import vision from "@google-cloud/vision";
async function quickstart() {
  // Imports the Google Cloud client library
  console.log("hii");
  // Creates a client
  const client = new vision.ImageAnnotatorClient({
    keyFilename:
      "../secureKeys/pdf-to-text-conversion-416404-823fab80fa5a.json",
  });

  const [result] = await client.textDetection("../data/splitImgs/left_5.png");
  // console.log(result);
  const labels = result.textAnnotations;
  console.log("Text:", labels[0].description);
  // labels.forEach((label) => console.log(label.description));

  // Performs label detection on the image file
  // const [result] = await client.labelDetection("./data/pdfs/pdf.pdf");
  // console.log("hii11");
  // const labels = result.labelAnnotations;
  // labels.forEach((label) => console.log(label.description));
}
quickstart();
