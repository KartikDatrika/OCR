import cv from "opencv4nodejs";

// Load your input image
const inputImagePath = "../data/imgs/52.png";
const outputLeftImagePath = "left_half.jpg";
const outputRightImagePath = "right_half.jpg";

// Load the input image
const img = cv.imread(inputImagePath);

// Convert the image to grayscale
const grayImg = img.cvtColor(cv.COLOR_BGR2GRAY);

// Detect lines in the image using Hough Transform
const lines = grayImg.houghLinesP({
  rho: 1, // resolution of the accumulator in pixels
  theta: Math.PI / 180, // resolution of the theta angle in radians
  threshold: 80, // minimum number of intersections to detect a line
  minLineLength: 100, // minimum number of points that can form a line
  maxLineGap: 10, // maximum gap between two points to be considered in the same line
});

// Sort the lines by their orientation
const verticalLines = lines.filter((line) => Math.abs(line[1] - line[3]) > 5); // Adjust threshold as needed
verticalLines.sort((a, b) => (a[0] + a[2]) / 2 - (b[0] + b[2]) / 2);

// Take the first vertical line as the splitting line
const splittingLine = verticalLines[0];

// Calculate the x-coordinate of the splitting line
const splittingLineX = (splittingLine[0] + splittingLine[2]) / 2;

// Split the image based on the splitting line
const leftHalf = img.getRegion(new cv.Rect(0, 0, splittingLineX, img.rows));
const rightHalf = img.getRegion(
  new cv.Rect(splittingLineX, 0, img.cols - splittingLineX, img.rows)
);

// Save the left and right halves
cv.imwrite(outputLeftImagePath, leftHalf);
cv.imwrite(outputRightImagePath, rightHalf);

console.log("Image splitted successfully.");
