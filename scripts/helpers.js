import fs from "fs";
import path from "path";
import XLSX from "xlsx";
export const print = (log) => {
  console.log(log);
};
export const readFolder = (folderPath, processEachFile) => {
  // Read the contents of the folder
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Error reading folder:", err);
      return;
    }

    // Loop through each file
    files.forEach((file) => {
      // Construct the full path to the file
      const filePath = path.join(folderPath, file);

      // Check if it's a file (not a subfolder)
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error("Error getting file stats:", err);
          return;
        }

        if (stats.isFile() && !filePath.endsWith("DS_Store")) {
          // console.log("File:", filePath);
          if (processEachFile) {
            processEachFile(file, filePath);
          }
          // Do something with the file...
          // For example, read its contents, process it, etc.
        }
      });
    });
  });
};

export const convertToExcel = (
  rows = ["string1", "string2", "string3"],
  excelName = "output1"
) => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Add worksheet
  const ws = XLSX.utils.aoa_to_sheet(
    rows.map((row) => (Array.isArray(row) ? row : [row]))
  );

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // Write workbook to file
  XLSX.writeFile(wb, excelName + ".xlsx");
};

export function getFileNameWithoutExtension(path) {
  // Extract the filename from the path
  let filename = path.replace(/^.*[\\\/]/, "");

  // Find the last dot in the filename (to handle cases where the filename itself contains dots)
  const lastDotIndex = filename.lastIndexOf(".");

  // If a dot is found and it's not the first character, slice the string to remove the extension
  if (lastDotIndex !== -1 && lastDotIndex !== 0) {
    filename = filename.slice(0, lastDotIndex);
  }

  return filename;
}

export const writeFile = async (data, path) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, "utf8", (err) => {
      if (err) {
        console.error("Error writing JSON file:", err);
        reject(err);
        return;
      }
      resolve();
    });
  });
};

export const readFile = (path, processData) => {
  // Read the JSON file
  fs.readFile(path, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }
    processData(data);
  });
};

export const getOptions = (line, options = []) => {
  const optionsRegex = /\d+\s*\.\s*(.*?)\s*(?=\d+\.|$)/g;

  let match;
  while ((match = optionsRegex.exec(line))) {
    options.push(match[1]);
  }
  return options;
};

export const createRowsForSingleQO = (d) => {
  return [
    [, d.question, , d.options[0]],
    [, , , d.options[1]],
    [, , , d.options[2]],
    [, , , d.options[3]],
  ];
};

const isOptionNo = (line, no) => {
  return line.includes(no + ".") || line.includes(no + " .");
};

export const isOption = (line) => {
  // check all 4 options
  if (
    isOptionNo(line, "1") &&
    isOptionNo(line, "2") &&
    isOptionNo(line, "3") &&
    isOptionNo(line, "4")
  ) {
    return "O";
  }
  // check  first 2 options
  else if (isOptionNo(line, "1") && isOptionNo(line, "2")) {
    return "O";
  }
  // check  last 2 options
  else if (isOptionNo(line, "3") && isOptionNo(line, "4")) {
    return "O";
  } else {
    if (
      line.includes("1.") ||
      line.includes("2.") ||
      line.includes("3.") ||
      line.includes("4.")
    ) {
      return "O";
    }
    return "";
  }
};

export const isOptionHighConfidence = (line) => {
  if (
    line.includes("1.") &&
    line.includes("2.") &&
    line.includes("3.") &&
    line.includes("4.")
  ) {
    return "O";
  }
  //check first 2
  else if (line.includes("1.") && line.includes("2.")) {
    return "O";
  }
  //check last 2
  else if (line.includes("3.") && line.includes("4.")) {
    return "O";
  } else {
    return "";
  }
};
const isOptionParanthesis = (line, no, isStartsWith = false) => {
  if (isStartsWith) {
    return line.startsWith("(" + no + ")") || line.startsWith("( " + no + " )");
  }
  return (
    line.includes("(" + no + ")") ||
    line.includes("( " + no + " )") ||
    line.includes(no + ")")
  );
};
export const isOptionWithParenthsis = (line) => {
  // check all 4 options with paranthesis
  if (
    isOptionParanthesis(line, "1") &&
    isOptionParanthesis(line, "2") &&
    isOptionParanthesis(line, "3") &&
    isOptionParanthesis(line, "4")
  ) {
    return "O";
  }
  // check  first 2 options with paranthesis
  else if (isOptionParanthesis(line, "1") && isOptionParanthesis(line, "2")) {
    return "O";
  }
  // check  last 2 options with paranthesis
  else if (isOptionParanthesis(line, "3") && isOptionParanthesis(line, "4")) {
    return "O";
  } else {
    return isOptionParanthesis(line, "1") ||
      isOptionParanthesis(line, "2") ||
      isOptionParanthesis(line, "3") ||
      isOptionParanthesis(line, "4")
      ? "O"
      : "";
  }
};

export const getOptionsWithParanthesis = (line, options = []) => {
  const optionsRegex = /\(\d+\)\s*(.*?)\s*(?=\(\d+\)|$)/g;
  let match;
  while ((match = optionsRegex.exec(line))) {
    if (match[1] !== "") {
      options.push(match[1]);
    } else {
      break;
    }
  }
  return options;
};

export const containsMoreThan2Words = (line) => line.split(" ").length > 1;
export const isQuestion = (line) => {
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

export const tagTextLines = (textLines) => {
  let tagLines = [];
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
            tagLines[index] = "Q";
            // if (
            //   index + 1 < textLines.length &&
            //   isOptionWithParenthsis(textLines[index + 1]) === "O" // isOptionHighConfidence
            // ) {
            //   tagLines[index] = "Q";
            //   tagLines[index + 1] = "O";
            // } else {
            //   tagLines[index] = "";
            // }
          }
        }
      } else if (tagLines[index - 1] === "O") {
        if (scannedQuestionsPaperData[qi]?.o?.length < 4) {
          tagLines[index] = isOptionWithParenthsis(line); // isOption
          if (tagLines[index] !== "O") {
            if (
              index + 1 < textLines.length &&
              isOptionWithParenthsis(textLines[index + 1]) === "O"
            ) {
              tagLines[index] = "O";
              tagLines[index + 1] = "O";
            }
          }
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
      const o = getOptionsWithParanthesis(line); // getOptions
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
  return { tagLines, scannedQuestionsPaperData };
};
