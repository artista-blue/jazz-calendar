import argparse

import cv2 as cv
import pytesseract
from pdf2image import convert_from_path


class ESAnalyzer:

    def __init__(self, pdf_path, debug=False):
        self.pdf_path = pdf_path
        self.debug = debug

    def pdf2img(self):
        images = convert_from_path(self.pdf_path, dpi=400)
        fname = 'from_pdf_to_png.png'
        images[0].save(fname, 'png')
        self.img_path = fname
        return cv.imread(self.img_path)

    def resize(self, img, w=1, h=1):
        height, width, _ = img.shape
        height = height * h
        width = width * w
        return cv.resize(img, (height, width))

    def to_gray(self, img):
        return cv.cvtColor(img, cv.COLOR_RGB2GRAY)

    def to_binary(self, img):
        _, new_img = cv.threshold(img, 200, 255, cv.THRESH_BINARY)
        return new_img

    def debug(self, c, img):
        x, y, w, h = cv.boundingRect(c)
        trim = img[y:y+h, x:x+w]
        title = 'x={0}, y={1}, h={2}, w={3}'.format(x, y, h, w)
        self.show(text=title, img=trim)

    def find_contours(self, img, width=None, err=0.10):
        _contours, hierarchy = cv.findContours(img, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
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

    def img2string(self, img):
        texts = [
            ('①', '1'),
            ('②', '2'),
            ('③', '3'),
            ('④', '4'),
            ('⑤', '5'),
            ('⑥', '6'),
            ('⑦', '7'),
            ('⑧', '8'),
            ('⑨', '9'),
            ('⑩', '10'),
            ('⑪', '11'),
            ('⑫', '12'),
            ('⑬', '13'),
            ('⑭', '14'),
            ('⑮', '15'),
            ('⑯', '16'),
            ('⑰', '17'),
            ('⑱', '18'),
            ('⑲', '19'),
            ('⑳', '20'),
        ]
        string = pytesseract.image_to_string(img, lang='jpn')
        for t in texts:
            string = string.replace(t[0], t[1])
        return string

    def analyze_contours(self, contours, img):
        item_list = []
        for c in contours:
            x, y, w, h = cv.boundingRect(c)
            print(x, y, w, h)
            tmp_img = img[y:y+h, x:x+w]
            self.show(img=tmp_img)
            string = self.img2string(tmp_img)
            item_list.append((x, y, w, h, string))
        return item_list

    """
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
    """

    def find_date(self, coordinates, item_list):
        for item in item_list:
            x, y, w, h, string = item
            xmin = x
            xmax = x + w
            ymin = y
            ymax = y + h
            if coordinates[0] < xmin or xmax < coordinates[0]:
                continue
            if coordinates[1] < ymin or ymax < coordinates[1]:
                continue
            return string
        return None
                
    def detect_date(self, item_list):
        schedule = []
        for item in item_list:
            x, y, w, h, string = item
            if len(string) < 20:
                continue
            target_coordinates = (
                (x + x + w) / 2,
                y - 100
            )
            date = self.find_date(target_coordinates, item_list)
            schedule.append(
                (x, y, w, h, date, string)
                )
        return sorted(schedule, key=lambda x:(x[1], x[0]))

    def execute(self):
        img = self.pdf2img()
        img = self.resize(img, w=3, h=3)
        img = self.to_gray(img)
        img = self.to_binary(img)
        contours = self.find_contours(img, width=1320)
        item_list = self.analyze_contours(contours, img)
        schedules = self.detect_date(item_list)
        for sched in schedules:
            print(sched)

    def show(self, text="result", img=None):
        if self.debug is False:
            return
        if img is None:
            return
        cv.imshow(text, img)
        cv.waitKey(0)
        cv.destroyAllWindows()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('pdf_path')
    parser.add_argument('--debug', action='store_true')
    args = parser.parse_args()

    esa = ESAnalyzer(args.pdf_path, debug=args.debug)
    esa.execute()
