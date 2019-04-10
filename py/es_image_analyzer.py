import argparse

import cv2 as cv
import numpy as np

from pdf2image import convert_from_path
import pytesseract


def pdf2img(pdf_path):
    images = convert_from_path(pdf_path, dpi=400)
    fname = 'from_pdf_to_png.png'
    images[0].save(fname, 'png')
    return fname


class ESAnalyzer:

    def __init__(self, img_path):
        self.img_path = img_path
        self.img = cv.imread(self.img_path)
        self.height, self.width, channels = self.img.shape

    def resize(self, num=3):
        self.height = self.height * num
        self.width = self.width * num
        self.img = cv.resize(self.img, (self.height, self.width))

    def to_gray(self):
        self.img = cv.cvtColor(self.img, cv.COLOR_RGB2GRAY)

    def to_binary(self):
        retval, self.img = cv.threshold(self.img, 200, 255, cv.THRESH_BINARY)

    def delate(self):
        kernel = np.ones((2, 2), np.uint8)
        self.img = cv.dilate(self.img, kernel, iterations=2)

    def debug(self, c):
        x, y, w, h = cv.boundingRect(c)
        trim = self.img[y:y+h, x:x+w]
        title = 'x={0}, y={1}, h={2}, w={3}'.format(x, y, h, w)
        print(title)
        cv.imshow(title, trim)
        cv.waitKey(0)
        cv.destroyAllWindows()

    def find_contours(self, width=None, err=0.10):
        _contours, hierarchy = cv.findContours(self.img, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
        contours = []
        l_limit = width - width * err
        h_limit = width + width * err
        for c in _contours:
            x, y, w, h = cv.boundingRect(c)
            if w < l_limit or w > h_limit:
                continue
            print(x, y, w, h)
            contours.append(c)
        return contours

    def analyze_contours(self, contours):
        for c in contours:
            self.debug(c)
            x, y, w, h = cv.boundingRect(c)
            print(x, y, w, h)
            tmp_img = self.img[y:y+h, x:x+w]
            self.show(img=tmp_img)
            string = pytesseract.image_to_string(tmp_img, lang='jpn')
            print(string)

    def hoge(self, contours):
        dst = cv.imread(self.img_path, cv.IMREAD_COLOR)
        dst = cv.drawContours(dst, contours, -1, (0, 0, 255, 255), 2, cv.LINE_AA)
        cv.imwrite('debug_1.png', dst)
        dst = cv.imread(self.img_path, cv.IMREAD_COLOR)
        for i, contour in enumerate(contours):
            area = cv.contourArea(contour)
            if area < 1000:
                continue
            x, y, w, h = cv.boundingRect(contour)
            self.img = cv.rectangle(self.img, (x, y), (x+w, y+h), (0, 255, 0), 2)
        cv.imwrite('result.png', self.img)

    def execute(self):
        self.resize()
        self.to_gray()
        self.to_binary()
        contours = self.find_contours(width=1320)
        self.analyze_contours(contours)
        self.show()

    def show(self, text="result", img=None):
        if img is None:
            img = self.img
        cv.imshow(text, img)
        cv.waitKey(0)
        cv.destroyAllWindows()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('pdf_path')
    args = parser.parse_args()

    png_path = pdf2img(args.pdf_path)
    esa = ESAnalyzer(png_path)
    esa.execute()
