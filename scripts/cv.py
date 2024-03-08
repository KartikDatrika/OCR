import numpy as np
import os
import numpy as np
import os
import cv2
for entry in os.scandir("../data/imgs"):
    try:
        if entry.is_file():
            path = "../data/imgs/" + entry.name
            if entry.name == ".DS_Store":
                continue
            justName = entry.name.split(".")[0]
            # Load your input img
            input_image_path = path
            output_left_image_path = "../data/splitImgs/"+ justName + '_left.png'
            output_right_image_path =  "../data/splitImgs/"+justName + '_right.png'
            # Read the input img
            img = cv2.imread(input_image_path)
            print("Processing ",input_image_path)
            gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
            # Apply edge detection method on the img
            edges = cv2.Canny(gray,50,150,apertureSize = 3)
            # Detect lines in the img using Hough Transform
            lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=200, minLineLength=100, maxLineGap=10)
            # lines = cv2.HoughLines(edges,1,np.pi/180,200)
            # vertical_lines = []
            # for line in lines:
            #     rho, theta = line[0]
            #     if np.abs(theta) < 0.2:  # Check if the line is almost vertical
            #         vertical_lines.append(line)
            # print(len(vertical_lines))
            '''
            rho, theta = vertical_lines[0]:
            a = np.cos(theta)
            b = np.sin(theta)
            x0 = a*rho
            y0 = b*rho
            x1 = int(x0 + 1000*(-b))
            y1 = int(y0 + 1000*(a))
            x2 = int(x0 - 1000*(-b))
            y2 = int(y0 - 1000*(a))
            '''
            # Split the img based on the detected line
            filtered_lines=[]
            image_center = img.shape[1] // 2  # Calculate the x-coordinate of the image center
            for line in lines:
                [[x1, y1, x2, y2]] = line
                mid_point = (x1 + x2) // 2  # Calculate the mid point of x coordinates
                angle = np.arctan2(y2 - y1, x2 - x1)
                angle_degrees = np.degrees(angle)
                # print(path,angle_degrees)
                if abs(angle_degrees) > 80 and abs(angle_degrees) < 100 and abs(mid_point - image_center) < 15:
                    # print(mid_point,image_center,abs(mid_point - image_center))
                    filtered_lines.append(line)
            if len(filtered_lines) == 0:
                print("No lines found in ",path)
                continue
            mask_left = np.zeros(gray.shape, dtype=np.uint8)
            mask_right = np.zeros(gray.shape, dtype=np.uint8)
            [[x1, y1, x2, y2]] = filtered_lines[0]
            for y in range(img.shape[0]):
                for x in range(img.shape[1]):
                    if (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1) > 0:
                        mask_left[y, x] = 255
                    else:
                        mask_right[y, x] = 255
            left_half = cv2.bitwise_and(img, img, mask=mask_left)
            right_half = cv2.bitwise_and(img, img, mask=mask_right)
            # Save the left and right halves
            cv2.imwrite(output_left_image_path, left_half)
            cv2.imwrite(output_right_image_path, right_half)
    except Exception as e:
        print("An error occurred:", str(e))
