import {
  readFile,
  convertToExcel,
  getOptions,
  readFolder,
  print,
  createRowsForSingleQO,
  isOptionHighConfidence,
  isOption,
  getOptionsWithParanthesis,
  isOptionWithParenthsis,
} from "./helpers.js";
import _ from "lodash";
import { processTextToRows } from "./parseAndCreateExcelRows.js";
/*
readFile("../data/tns/1_left.json", (data) => {
  const jsonData = JSON.parse(data);
  const [firstItem, ...restItems] = jsonData.textAnnotations;
  let tagLines = [];
  const rows = [];
  // Assuming textAnnotationsArray restItems the output from Google Cloud Vision API
  const sortedTextAnnotations = restItems.sort((a, b) => {
    return a.boundingPoly.vertices[3].y - b.boundingPoly.vertices[3].y;
  });
  const [{ x: x1, y: y1 }, { x: x2 }, { y: y2 }] =
    firstItem.boundingPoly.vertices;
  sortedTextAnnotations.forEach((annotation, index) => {
    const [{ x: xa, y: ya }, { x: xb }, { y: yb }] =
      annotation.boundingPoly.vertices;
    const data = { d: annotation.description, xa, xb, ya, yb };
    if (index === 0) {
      rows.push([data]);
    } else {
      const lastRow = rows[rows.length - 1];
      if (Math.abs(yb - lastRow[lastRow.length - 1].yb) >= 5) {
        lastRow.sort((a, b) => a.xa - b.xa);
        rows.push([data]);
      } else {
        lastRow.push(data);
      }
    }
  });
  const textLines = [];
  rows.forEach((row) => {
    textLines.push(
      row.reduce((acc, annotation) => {
        return acc + annotation.d + " ";
      }, "")
    );
  });

  const containsMoreThan2Words = (line) => line.split(" ").length > 1;

  const isQuestion = (line) => {
    if (line.includes(".")) {
      const [qNo, qText] = line.split(".");
      if (isNaN(+qNo.trim())) {
        if (containsMoreThan2Words(qNo) || containsMoreThan2Words(qText)) {
          return "?";
        } else {
          return "";
        }
      } else {
        return "Q";
      }
    } else {
      return containsMoreThan2Words(line) ? "?" : "";
    }
  };

  const scannedQuestionsPaperData = [{}];
  let qi = 0;
  textLines.forEach((line, index) => {
    if (index === 0) {
      tagLines[index] = isQuestion(line);
    } else {
      // Questions // Options Tagging
      // case can be
      // question continuation
      // options
      // options continuation
      // question

      if (tagLines[index - 1] === "Q") {
        tagLines[index] = isOptionWithParenthsis(line); // isOption
        if (!tagLines[index]) {
          tagLines[index] = isQuestion(line);
          if (tagLines[index] === "?") {
            if (
              index + 1 < textLines.length &&
              isOptionWithParenthsis(textLines[index + 1]) === "O" // isOptionHighConfidence
            ) {
              tagLines[index] = "Q";
              tagLines[index + 1] = "O";
            } else {
              tagLines[index] = "";
            }
          }
        }
      } else if (tagLines[index - 1] === "O") {
        if (scannedQuestionsPaperData[qi]?.o?.length < 4) {
          tagLines[index] = isOptionWithParenthsis(line); // isOption
        } else {
          tagLines[index] = isQuestion(line);
          if (tagLines[index] === "?") {
            if (
              index + 1 < textLines.length &&
              isOptionWithParenthsis(textLines[index + 1]) === "O" // isOptionHighConfidence
            ) {
              tagLines[index] = "Q";
              tagLines[index + 1] = "O";
            }
          }
        }
      } else if (tagLines[index - 1] === "?") {
        tagLines[index] = isQuestion(line);
      }
      if (!tagLines[index]) {
        tagLines[index] = isQuestion(line);
      }
    }

    if (tagLines[index] === "Q") {
      const q = line;
      if (!scannedQuestionsPaperData[qi]?.q) {
        scannedQuestionsPaperData[qi].q = q.includes(".") ? q.split(".")[1] : q;
      } else {
        if (scannedQuestionsPaperData[qi]?.o?.length) {
          if (scannedQuestionsPaperData[qi]?.o?.length < 4) {
            const emptyOptions = Array(
              4 - scannedQuestionsPaperData[qi]?.o?.length
            ).fill("");
            scannedQuestionsPaperData[qi].o = [
              ...scannedQuestionsPaperData[qi]?.o,
              ...emptyOptions,
            ];
          }
          qi = qi + 1;
          scannedQuestionsPaperData.push({
            q: q.includes(".") ? q.split(".")[1] : q,
          });
        } else {
          scannedQuestionsPaperData[qi].q += q;
        }
      }
    } else if (tagLines[index] === "O") {
      const o = getOptionsWithParanthesis(line);
      if (!scannedQuestionsPaperData[qi]?.o) {
        scannedQuestionsPaperData[qi].o = o;
      } else {
        scannedQuestionsPaperData[qi].o = [
          ...scannedQuestionsPaperData[qi].o,
          ...o,
        ];
      }
    }
  });
  tagLines.forEach((line, index) => console.log(line + " " + textLines[index]));
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

  scannedQuestionsPaperData.map((d) => {
    excelRows.push(createRowsForSingleQO(d));
  });
});

convertToExcel(rows, "../data/tns/" + name);
*/
readFolder("../data/tns", processTextToRows);
// print(
//   getOptionsWithParanthesis(
//     ". ( ( 3 1 ) ) A A , and C and B only D only 2 ( 4 ) B A. and B , C C and only D "
//   )
// );

// print(isOptionWithParenthsis("C and D only ( 2 ) A. C and D only "));
