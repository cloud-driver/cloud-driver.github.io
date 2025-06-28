#!/usr/bin/env python3
"""
Image Resizer - 將影像調整為指定解析度的工具

用法：
    python image_resizer.py -i input.jpg -o output.jpg -W 800 -H 600 [--keep-aspect]
"""

import argparse
import os
from PIL import Image


def resize_image(input_path: str, output_path: str, width: int, height: int, keep_aspect: bool):
    """
    將輸入影像調整為指定解析度，並儲存至輸出路徑。
    若 keep_aspect=True，則維持長寬比。
    """
    with Image.open(input_path) as img:
        if keep_aspect:
            img.thumbnail((width, height), Image.LANCZOS)
        else:
            img = img.resize((width, height), Image.LANCZOS)

        # 確保輸出目錄存在
        output_dir = os.path.dirname(output_path)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)

        img.save(output_path)
        print(f"已儲存調整後影像至：{output_path}")


def main():
    parser = argparse.ArgumentParser(description="Resize images to specified resolution.")
    parser.add_argument("-i", "--input", required=True, help="輸入影像路徑")
    parser.add_argument("-o", "--output", required=True, help="輸出影像路徑")
    parser.add_argument("-W", "--width", type=int, required=True, help="目標寬度 (像素)")
    parser.add_argument("-H", "--height", type=int, required=True, help="目標高度 (像素)")
    parser.add_argument("--keep-aspect", action="store_true", help="是否維持長寬比 (預設 False)")
    args = parser.parse_args()

    resize_image(
        args.input,
        args.output,
        args.width,
        args.height,
        args.keep_aspect
    )


if __name__ == "__main__":
    main()
