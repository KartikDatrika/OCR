import fs from "fs";
import path from "path";
import XLSX from "xlsx";

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
  arrayOfStrings = ["string1", "string2", "string3"],
  excelName = "output1"
) => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Add worksheet
  const ws = XLSX.utils.aoa_to_sheet(arrayOfStrings.map((str) => [str]));

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // Write workbook to file
  XLSX.writeFile(wb, excelName + ".xlsx");

  console.log(excelName + " file has been generated.");
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
