import fs from "fs";
import path from "path";

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
          console.log("File:", filePath);
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
