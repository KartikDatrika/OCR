// Imports the Google Cloud client library
import Translate from "@google-cloud/translate";

// Creates a client

const translateServiceClient = new Translate.TranslationServiceClient({
  keyFilename: "../secureKeys/pdf-to-text-conversion-416404-823fab80fa5a.json",
});

async function translateText() {
  const text = "The text to translate, e.g. Hello, world!";
  const target = "te"; // Telugu language code

  // Translates the text into the target language

  const [translation] = await translate(text, target);

  console.log(`Translation: ${translation}`);
}

translateText();
