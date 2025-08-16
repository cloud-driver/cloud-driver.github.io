import tkinter as tk
from tkinter import filedialog, messagebox
from moviepy.editor import VideoFileClip, AudioFileClip
import os

class MediaCutterApp:
    def __init__(self, root):
        self.root = root
        self.root.title("媒體裁切工具")
        self.root.geometry("600x400")

        # 檔案路徑
        self.file_path = None

        # GUI 元素
        self.create_widgets()

    def create_widgets(self):
        # 檔案選擇
        self.label_file = tk.Label(self.root, text="檔案路徑：尚未選擇檔案")
        self.label_file.pack(pady=10)

        self.btn_browse = tk.Button(self.root, text="選擇檔案", command=self.browse_file)
        self.btn_browse.pack(pady=5)

        # 開始時間
        self.label_start = tk.Label(self.root, text="開始時間 (格式：分:秒 或 秒)：")
        self.label_start.pack(pady=5)
        self.entry_start = tk.Entry(self.root)
        self.entry_start.pack(pady=5)

        # 結束時間
        self.label_end = tk.Label(self.root, text="結束時間 (格式：分:秒 或 秒)：")
        self.label_end.pack(pady=5)
        self.entry_end = tk.Entry(self.root)
        self.entry_end.pack(pady=5)

        # 裁切按鈕
        self.btn_cut = tk.Button(self.root, text="裁切媒體", command=self.cut_media)
        self.btn_cut.pack(pady=20)

        # 進度標籤
        self.label_status = tk.Label(self.root, text="")
        self.label_status.pack(pady=10)

    def browse_file(self):
        filetypes = (
            ("媒體檔案", "*.mp4 *.avi *.mkv *.mp3 *.wav"),
            ("所有檔案", "*.*")
        )
        self.file_path = filedialog.askopenfilename(title="選擇影片或音檔", filetypes=filetypes)
        if self.file_path:
            self.label_file.config(text=f"檔案路徑：{self.file_path}")
        else:
            self.label_file.config(text="檔案路徑：尚未選擇檔案")

    def parse_time(self, time_str):
        """將輸入的時間字串轉換為秒數，支援 '分:秒' 或 '秒' 格式"""
        try:
            if ":" in time_str:
                minutes, seconds = map(float, time_str.split(":"))
                return minutes * 60 + seconds
            else:
                return float(time_str)
        except ValueError:
            raise ValueError("時間格式錯誤，請輸入 '分:秒' 或 '秒'！")

    def cut_media(self):
        if not self.file_path:
            messagebox.showerror("錯誤", "請先選擇一個檔案！")
            return

        try:
            start_time = self.parse_time(self.entry_start.get())
            end_time = self.parse_time(self.entry_end.get())
        except ValueError as e:
            messagebox.showerror("錯誤", str(e))
            return

        if start_time < 0 or end_time <= start_time:
            messagebox.showerror("錯誤", "開始時間必須大於等於0，且結束時間必須大於開始時間！")
            return

        self.label_status.config(text="處理中，請稍候...")
        self.root.update()

        try:
            # 檢查檔案類型
            file_extension = os.path.splitext(self.file_path)[1].lower()
            output_path = os.path.splitext(self.file_path)[0] + "_cut" + file_extension

            if file_extension in [".mp4", ".avi", ".mkv"]:
                # 處理影片
                with VideoFileClip(self.file_path) as video:
                    if end_time > video.duration:
                        messagebox.showerror("錯誤", f"結束時間超出影片長度（{video.duration}秒）！")
                        self.label_status.config(text="")
                        return
                    new_video = video.subclip(start_time, end_time)
                    new_video.write_videofile(output_path, codec="libx264", audio_codec="aac")
            elif file_extension in [".mp3", ".wav"]:
                # 處理音檔
                with AudioFileClip(self.file_path) as audio:
                    if end_time > audio.duration:
                        messagebox.showerror("錯誤", f"結束時間超出音檔長度（{audio.duration}秒）！")
                        self.label_status.config(text="")
                        return
                    new_audio = audio.subclip(start_time, end_time)
                    new_audio.write_audiofile(output_path)
            else:
                messagebox.showerror("錯誤", "不支援的檔案格式！")
                self.label_status.config(text="")
                return

            self.label_status.config(text=f"裁切完成！輸出檔案：{output_path}")
            messagebox.showinfo("成功", "媒體檔案已成功裁切！")
        except Exception as e:
            messagebox.showerror("錯誤", f"裁切過程中發生錯誤：{str(e)}")
            self.label_status.config(text="")

if __name__ == "__main__":
    root = tk.Tk()
    app = MediaCutterApp(root)
    root.mainloop()
