import numpy as np
import os
import numpy as np
import os
import cv2
import math

def calculate_angle_vertical_and_line(x1, y1, x2, y2):
    large_number = 10**9  # A very large number to represent vertical line slope
    m_non_vertical = (y2 - y1) / (x2 - x1)
    angle = math.atan(abs((m_non_vertical - large_number) / (1 + m_non_vertical * large_number)))
    return angle


var = 0;
# missed_paths = ['../data/imgs/77.png', '../data/imgs/76.png', '../data/imgs/202.png', '../data/imgs/59.png', '../data/imgs/159.png', '../data/imgs/165.png', '../data/imgs/199.png', '../data/imgs/9.png', '../data/imgs/39.png', '../data/imgs/139.png', '../data/imgs/134.png', '../data/imgs/120.png', '../data/imgs/33.png', '../data/imgs/292.png', '../data/imgs/235.png', '../data/imgs/142.png', '../data/imgs/1.png', '../data/imgs/153.png'];
for entry in os.scandir("../data/imgs"):
    try:
        if entry.is_file():
            path = "../data/imgs/" + entry.name
            if entry.name == ".DS_Store":
                continue
            print(entry.name)
            justName = entry.name.split(".")[0]
            # if justName not in ["88","83","33","23"]:
            #     continue
            # Load your input img
            input_image_path = path
            output_left_image_path = "../data/splitImgs/"+ justName + '_left.png'
            output_right_image_path =  "../data/splitImgs/"+justName + '_right.png'
            # Read the input img
            img = cv2.imread(input_image_path)
            # print("Processing ",input_image_path)
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
                print(angle_degrees,abs(mid_point - image_center))
                if abs(angle_degrees) > 80 and abs(angle_degrees) < 100 and abs(mid_point - image_center) <= 50:
                    # print(mid_point,image_center,abs(mid_point - image_center))
                    filtered_lines.append(line)
            if len(filtered_lines) == 0:
                print(justName, "No lines found")
                var = var+1;
                # for line in lines:
                #     [[x1, y1, x2, y2]] = line
                #     mid_point = (x1 + x2) // 2  # Calculate the mid point of x coordinates
                #     angle = np.arctan2(y2 - y1, x2 - x1)
                #     angle_degrees = np.degrees(angle)
                #     print(angle_degrees, abs(mid_point - image_center),img.shape)

                filtered_lines.append([[image_center,0,image_center,img.shape[0]]])
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
            
            xl, yl, wl, hl = cv2.boundingRect(mask_left)
           
            xr, yr, wr, hr = cv2.boundingRect(mask_right)
           
            left_part = left_half[0:hl,xl:xl+wl]
            right_part = right_half[0:hr,xr:xr+wr]
            if(x1 != x2):
                angle = -math.degrees(calculate_angle_vertical_and_line(x1, y1, x2, y2))
            # Rotate the right part by the specified angle
                rrows, rcols = right_part.shape[:2]
                Mr = cv2.getRotationMatrix2D((rcols//2, rrows//2), angle, 1)
                rotated_right_part = cv2.warpAffine(right_part, Mr, (rcols, rrows))
                lrows, lcols = left_part.shape[:2]
                Ml = cv2.getRotationMatrix2D((lcols//2, lrows//2), angle, 1)
                rotated_left_part = cv2.warpAffine(left_part, Ml, (lcols, lrows))
                left_part = rotated_left_part
                right_part = rotated_right_part
            cv2.imwrite(output_left_image_path, left_part)
            cv2.imwrite(output_right_image_path, right_part)

    except Exception as e:
        print("An error occurred:", str(e))

# print("Missed paths",missed_paths)