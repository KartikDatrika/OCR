// for vertical lines algo
export const createOrderForDetectedText = (data) => {
  const jsonData = JSON.parse(data);
  const [firstItem, ...restItems] = jsonData.textAnnotations;
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
      if (Math.abs(yb - lastRow[lastRow.length - 1].yb) >= 8) {
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
      row.reduce((acc, annotation, index) => {
        if (index > 0) {
          if (row[index].xa - row[index - 1].xa > 8) {
            acc += " ";
          }
        }
        acc += annotation.d;
        return acc;
      }, "")
    );
  });
  return textLines;
};

export const parseBasedOnQandAFormats = (textLines) => {
  // for question no as 1.
  // for options as 1) 2)
  let questions = [];
  const optionsInNewLines = textLines
    .join("\n")
    .replace(/\d+\)(.*?)\b(?=\d+\)|$)/g, "$&\n");
  // Define the regular expression pattern to match questions and answers
  if (
    optionsInNewLines.includes("1)") &&
    optionsInNewLines.includes("2)") &&
    optionsInNewLines.includes("3)") &&
    optionsInNewLines.includes("4)")
  ) {
    const matches = Array.from(
      optionsInNewLines.matchAll(
        /(\d+\..+?)\s*(?<options>\d+\).+?)\s*(?=\d+\.|KEY|$)/gs
      )
    );
    questions = matches.map((match, index) => {
      const question = match[1].replaceAll("\n", " ").trim();
      const options = match[2]
        .split(/\d+\)/)
        .map((option) => option.replaceAll("\n", " ").trim())
        .filter((o) => o);
      return { question, options };
    });
  }
  return questions;
};

// for no line algocd
