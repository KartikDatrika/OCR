import {
  getFileNameWithoutExtension,
  readFile,
  createRowsForSingleQO,
  convertToExcel,
  writeFile,
} from "./helpers.js";
import {
  createOrderForDetectedText,
  parseBasedOnQandAFormats,
} from "./parsers.js";
import _ from "lodash";
const errorParsing = [];
export const processTextToRows = (f, path) => {
  const name = getFileNameWithoutExtension(path);
  // add try catch block below

  readFile("../data/tns/" + name + ".json", async (data) => {
    try {
      const textLines = createOrderForDetectedText(data);
      // await writeFile(
      //   textLines.join("\n").replace(/\d+\)(.*?)\b(?=\d+\)|$)/g, "$&\n"),
      //   "../data/scannedTxt/" + name + ".txt"
      // );
      const questions = parseBasedOnQandAFormats(textLines);
      await writeFile(
        JSON.stringify(questions, null, 2),
        "../data/taggedTns/" + name + ".json"
      );
      if (questions.length) {
        const excelRows = [
          [
            [
              "TestName",
              "Question",
              "Image",
              "answers",
              "answerImage",
              "correct",
              "state",
              "exam",
              "subject",
              "language",
            ],
          ],
        ];
        questions.map((d) => {
          if (d.options.length === 4) {
            excelRows.push(createRowsForSingleQO(d));
          } else {
            console.log(name, d);
          }
        });
        if (excelRows.length > 1) {
          convertToExcel(_.flatten(excelRows), "../data/excels/" + name);
        }
      }
    } catch (e) {
      errorParsing.push(name);
      console.log(name, e);
    }
  });
};
