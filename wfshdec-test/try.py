import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from PIL import Image, ImageTk
import json
import os
import shutil
import uuid
from deep_translator import GoogleTranslator
import re
from html import unescape

translator = GoogleTranslator(source='auto', target='zh-TW')

class JSONEditorApp:
    def __init__(self, root):
        """初始化視窗及各個變數"""
        self.root = root
        self.root.title("實驗班網頁 JSON 編輯器")
        self.data = {}
        self.base_dir = ""
        self.current_section = None
        self.selected_item_index = None
        self.current_images = []
        self.current_files = []
        self.drag_start_index = None
        self.image_references = []
        self.title_entry = None
        self.content_text = None
        self.date_entry = None
        self.tags_entry = None
        self.current_videos = []

    def start(self):
        """讓使用者開啟有data.json的資料夾"""
        self.base_dir = filedialog.askdirectory(title="選擇包含 data.json 的資料夾")
        if not self.base_dir:
            return
        json_path = os.path.join(self.base_dir, "data.json")
        if not os.path.exists(json_path):
            messagebox.showerror("錯誤", "找不到 data.json")
            return
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                self.data = json.load(f)
        except json.JSONDecodeError:
            messagebox.showerror("錯誤", "data.json 格式無效")
            return

        self.load_translation_cache()
        self.build_ui()
        self.build_section_combos()

    def load_translation_cache(self):
        """從 data.json 的所在資料夾讀取快取檔"""
        cache_path = os.path.join(self.base_dir, "translation_cache.json")
        if os.path.exists(cache_path):
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    self.translation_cache = json.load(f)
            except Exception as e:
                print(f"快取讀取失敗: {e}")
                self.translation_cache = {}
        else:
            self.translation_cache = {}

    def build_ui(self):
        """建立UI介面"""
        self.root.grid_columnconfigure(0, weight=1)
        self.root.grid_rowconfigure(1, weight=1)

        section_frame = ttk.Frame(self.root)
        section_frame.grid(row=0, column=0, sticky="ew", padx=5, pady=5)
        ttk.Label(section_frame, text="選擇目錄:").pack(side=tk.LEFT)
        self.combo_vars = []
        self.comboboxes = []
        self.section_frame = section_frame

        self.item_listbox = tk.Listbox(self.root, height=10)
        self.item_listbox.grid(row=1, column=0, sticky="nsew", padx=5, pady=5)
        self.item_listbox.bind("<<ListboxSelect>>", self.on_item_select)
        self.item_listbox.bind("<Button-1>", self.start_drag)
        self.item_listbox.bind("<B1-Motion>", self.do_drag)
        self.item_listbox.bind("<ButtonRelease-1>", self.end_drag)

        self.form_frame = ttk.Frame(self.root)
        self.form_frame.grid(row=2, column=0, sticky="nsew", padx=5, pady=5)
        self.form_frame.grid_columnconfigure(1, weight=1)

        button_frame = ttk.Frame(self.root)
        button_frame.grid(row=3, column=0, sticky="ew", padx=5, pady=5)
        ttk.Button(button_frame, text="新增項目", command=self.add_item).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="刪除項目", command=self.delete_item).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="儲存", command=self.save_json).pack(side=tk.LEFT, padx=5)
        copyright_label = ttk.Label(
            self.root, text="© 2025 萬芳高級中學數位學習實驗班．鄭宸翔",
            anchor="e", font=("Arial", 8)
        )
        copyright_label.place(
            relx=1.0, rely=1.0, anchor="se", x=-10, y=-10
        )

    def update_combos_from_level(self, level):
        """使用者在某層選單改變時，刷新該層以下的下拉選單與下方列表"""
        current = self.data
        path = []

        for i in range(level + 1):
            raw = self.combo_vars[i].get()
            if not raw:
                self.clear_form()
                self.item_listbox.delete(0, tk.END)
                self.current_section = ""
                return
            key = raw.split(" (")[0]
            path.append(key)
            current = current.get(key, {})

        for cb in self.comboboxes[level+1:]:
            cb.destroy()
        self.combo_vars = self.combo_vars[:level+1]
        self.comboboxes = self.comboboxes[:level+1]

        self.clear_form()
        self.item_listbox.delete(0, tk.END)

        if isinstance(current, dict):
            keys = list(current.keys())
            if not keys:
                self.current_section = "/".join(path)
                self.populate_items()
                return

            translated_keys = []
            for k in keys:
                full_path = "/".join(path + [k])
                zh_path = self.translation_cache.get(full_path)
                zh = zh_path.split("/")[-1] if zh_path else None
                if zh:
                    translated_keys.append(f"{k} ({zh})")
                else:
                    translated_keys.append(k)

            var = tk.StringVar()
            combo = ttk.Combobox(self.section_frame, textvariable=var, state="readonly", values=translated_keys)
            combo.pack(side=tk.LEFT, padx=5)
            self.combo_vars.append(var)
            self.comboboxes.append(combo)
            combo.bind("<<ComboboxSelected>>", lambda e: self.update_combos_from_level(len(self.combo_vars)-1))
            var.set("")
            self.current_section = ""
            self.populate_items()

        elif isinstance(current, list):
            self.current_section = "/".join(path)
            self.populate_items()

    def build_section_combos(self):
        """依據目前的 JSON 資料建立第一層的下拉選單（初始不預設選項）"""
        for cb in self.comboboxes:
            cb.destroy()
        self.combo_vars.clear()
        self.comboboxes.clear()

        current = self.data
        path = []

        if isinstance(current, dict):
            keys = list(current.keys())
            if not keys:
                return

            translated_keys = []
            for k in keys:
                full_path = "/".join(path + [k])
                zh_path = self.translation_cache.get(full_path)
                zh = zh_path.split("/")[-1] if zh_path else None
                if zh:
                    translated_keys.append(f"{k} ({zh})")
                else:
                    translated_keys.append(k)

            var = tk.StringVar()
            combo = ttk.Combobox(self.section_frame, textvariable=var, state="readonly", values=translated_keys)
            combo.pack(side=tk.LEFT, padx=5)
            self.combo_vars.append(var)
            self.comboboxes.append(combo)
            
            var.set("")
            combo.bind("<<ComboboxSelected>>", lambda e: self.update_combos_from_level(0))
        
        self.current_section = ""
        self.populate_items()

    def populate_items(self):
        """根據 current_section，從 JSON 裡取出該陣列的所有項目，顯示標題在 Listbox 裡"""
        if not self.current_section:
            return
        items = self.get_section_items(self.current_section)
        self.item_listbox.delete(0, tk.END)
        for item in items:
            self.item_listbox.insert(tk.END, item.get("title", "無標題"))

    def get_section_items(self, section):
        """根據路徑，回傳對應的 list"""
        path = section.split("/")
        current = self.data
        for part in path:
            current = current.get(part, {})
        return current if isinstance(current, list) else []

    def set_section_items(self, section, items):
        """把修改後的項目陣列重新存回 JSON 中對應位置"""
        path = section.split("/")
        current = self.data
        for part in path[:-1]:
            current = current.setdefault(part, {})
        current[path[-1]] = items

    def on_item_select(self, event=None):
        """使用者點選某個項目時，更新 selected_item_index，並呼叫 populate_form() 顯示對應資料"""
        selection = self.item_listbox.curselection()
        if selection:
            self.selected_item_index = selection[0]
            self.populate_form()

    def complain():
        """
        這個函式存在的意義就是讓我抱怨這個程式真的超級無敵難寫
        還有就是讓我可以湊一些行數
        讓這個程式感覺真的超級無敵長
        還有ㄚ
        我覺得這個東西都比我的專題還難了
        早知道專題用這個東西
        教授還能因此了解我對dict有多熟
        真的好麻煩喔這個東西
        干!
        但是說實在話
        我還是學到不少東西的啦
        感謝研發給我的這個機會啦
        """
        messagebox.showerror("ㄏㄏ")

    def clear_form(self):
        """ 清除下方表單畫面，準備重新渲染"""
        for widget in self.form_frame.winfo_children():
            widget.destroy()
        self.current_images = []
        self.current_files = []
        self.image_references.clear()
        self.title_entry = None
        self.content_text = None
        self.date_entry = None
        self.tags_entry = None
        self.current_videos = []

    def populate_form(self):
        """根據 selected_item_index 取得該項目的標題、內文、日期、標籤、圖片列表（縮圖顯示）、附加檔案（文字列出）並建立對應的輸入元件與按鈕（如上傳、刪除）"""
        self.clear_form()
        if self.selected_item_index is None or self.current_section is None:
            return
        items = self.get_section_items(self.current_section)
        if not (0 <= self.selected_item_index < len(items)):
            return
        item = items[self.selected_item_index]

        self.current_images = item.get("images", [])[:]
        self.current_files = item.get("files", [])[:]

        ttk.Label(self.form_frame, text="標題:").grid(row=0, column=0, sticky=tk.W)
        self.title_entry = ttk.Entry(self.form_frame)
        self.title_entry.grid(row=0, column=1, sticky="ew")
        self.title_entry.insert(0, item.get("title", ""))

        ttk.Label(self.form_frame, text="內文:").grid(row=1, column=0, sticky=tk.W)
        self.content_text = tk.Text(self.form_frame, height=5)
        self.content_text.grid(row=1, column=1, sticky="ew")
        # 這裡先統一設定紅字樣式
        self.content_text.tag_config("red", foreground="red")
        self.insert_content_with_red(item.get("content", ""))

        self.text_menu = tk.Menu(self.root, tearoff=0)
        self.text_menu.add_command(label="剪下", command=lambda: self.content_text.event_generate("<<Cut>>"))
        self.text_menu.add_command(label="複製", command=lambda: self.content_text.event_generate("<<Copy>>"))
        self.text_menu.add_command(label="貼上", command=lambda: self.content_text.event_generate("<<Paste>>"))
        self.text_menu.add_command(label="選取全部", command=self.select_all_text)
        self.text_menu.add_separator()
        self.text_menu.add_command(label="改成紅字", command=self.make_red_text)

        self.content_text.bind("<Button-3>", self.show_text_menu)

        ttk.Label(self.form_frame, text="日期:").grid(row=2, column=0, sticky=tk.W)
        self.date_entry = ttk.Entry(self.form_frame)
        self.date_entry.grid(row=2, column=1, sticky="ew")
        date_value = item.get("date", "") if item.get("date") is not None else ""
        self.date_entry.insert(0, date_value)

        ttk.Label(self.form_frame, text="標籤:").grid(row=3, column=0, sticky=tk.W)
        self.tags_entry = ttk.Entry(self.form_frame)
        self.tags_entry.grid(row=3, column=1, sticky="ew")
        tags_value = ", ".join(item.get("tags", [])) if item.get("tags") else ""
        self.tags_entry.insert(0, tags_value)

        btn_frame = ttk.Frame(self.form_frame)
        btn_frame.grid(row=4, column=1, sticky="w", pady=5)

        ttk.Button(btn_frame, text="新增圖片", command=self.upload_image).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="新增檔案", command=self.upload_file).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="新增影片連結", command=self.add_video_link_row).pack(side=tk.LEFT, padx=5)

        row = 6
        for img in self.current_images:
            try:
                full_path = os.path.join(self.base_dir, img) if not os.path.isabs(img) else img
                if os.path.exists(full_path):
                    img_obj = Image.open(full_path)
                    img_obj.thumbnail((100, 100))
                    photo = ImageTk.PhotoImage(img_obj)
                    label = tk.Label(self.form_frame, image=photo)
                    label.image = photo
                    self.image_references.append(photo)
                    label.grid(row=row, column=0)
                    ttk.Label(self.form_frame, text=os.path.basename(img)).grid(row=row, column=1, sticky=tk.W)
                    ttk.Button(self.form_frame, text="🗑", command=lambda p=img: self.remove_image(p)).grid(row=row, column=2)
                    row += 1
            except Exception as e:
                print(f"圖片載入失敗: {e}")

        for file in self.current_files:
            try:
                ttk.Label(self.form_frame, text=f"檔案: {os.path.basename(file)}").grid(row=row, column=1, sticky=tk.W)
                ttk.Button(self.form_frame, text="🗑", command=lambda f=file: self.remove_file(f)).grid(row=row, column=2)
                row += 1
            except Exception as e:
                print(f"檔案顯示失敗: {e}")

        self.current_videos = []
        for video in item.get("videos", []):
            video_var = tk.StringVar(value=video)
            entry = ttk.Entry(self.form_frame, textvariable=video_var, width=50)
            entry.grid(row=row, column=1, sticky="w", pady=2)
            ttk.Button(self.form_frame, text="🗑", command=lambda e=entry, v=video_var: self.remove_video_entry(e, v)).grid(row=row, column=2)
            self.current_videos.append(video_var)
            row += 1

    def select_all_text(self):
        self.content_text.tag_add("sel", "1.0", "end")

    def show_text_menu(self, event):
        """在滑鼠右鍵點擊文字框時顯示自訂選單"""
        try:
            self.text_menu.tk_popup(event.x_root, event.y_root)
        finally:
            self.text_menu.grab_release()

    def make_red_text(self):
        """將選取文字設為紅色（用 tag）"""
        try:
            start = self.content_text.index("sel.first")
            end = self.content_text.index("sel.last")
            self.content_text.tag_add("red", start, end)
            self.content_text.tag_config("red", foreground="red")
        except tk.TclError:
            messagebox.showwarning("提醒", "請先選取一段文字才能變色。")

    def add_item(self):
        """在目前 section 的陣列尾端加上一個預設的新項目，並自動選取它進入編輯"""
        if not self.current_section:
            return
        items = self.get_section_items(self.current_section)
        items.append({"title": "新項目", "content": "", "images": [], "files": [], "videos": [], "date": "", "tags": []})
        self.set_section_items(self.current_section, items)
        self.populate_items()
        self.item_listbox.selection_set(tk.END)
        self.on_item_select()

    def delete_item(self):
        """刪除目前選取的項目並更新 JSON 與 UI"""
        if self.selected_item_index is not None and self.current_section:
            items = self.get_section_items(self.current_section)
            if 0 <= self.selected_item_index < len(items):
                del items[self.selected_item_index]
                self.set_section_items(self.current_section, items)
                self.populate_items()
                self.clear_form()

    def upload_image(self):
        """讓使用者選擇圖片，複製到 files/ 資料夾中，並將相對路徑加到 images 欄位中"""
        path = filedialog.askopenfilename(filetypes=[("Image Files", "*.png;*.jpg;*.jpeg;*.gif")])
        if path and self.selected_item_index is not None:
            try:
                ext = os.path.splitext(path)[1]
                new_name = f"{uuid.uuid4().hex}{ext}"
                dest_dir = os.path.join(self.base_dir, "files")
                os.makedirs(dest_dir, exist_ok=True)
                dest = os.path.join(dest_dir, new_name)
                shutil.copy(path, dest)
                rel_path = os.path.relpath(dest, self.base_dir)
                self.current_images.append(rel_path)
                items = self.get_section_items(self.current_section)
                items[self.selected_item_index]["images"] = self.current_images.copy()
                self.set_section_items(self.current_section, items)
                self.populate_form()
            except Exception as e:
                messagebox.showerror("錯誤", f"上傳圖片失敗: {e}")

    def upload_file(self):
        """讓使用者選擇檔案，複製到 files/ 資料夾中，並將相對路徑加到 files 欄位中"""
        path = filedialog.askopenfilename()
        if path and self.selected_item_index is not None:
            try:
                ext = os.path.splitext(path)[1]
                new_name = f"{uuid.uuid4().hex}{ext}"
                dest_dir = os.path.join(self.base_dir, "files")
                os.makedirs(dest_dir, exist_ok=True)
                dest = os.path.join(dest_dir, new_name)
                shutil.copy(path, dest)
                rel_path = os.path.relpath(dest, self.base_dir)
                self.current_files.append(rel_path)
                items = self.get_section_items(self.current_section)
                items[self.selected_item_index]["files"] = self.current_files.copy()
                self.set_section_items(self.current_section, items)
                self.populate_form()
            except Exception as e:
                messagebox.showerror("錯誤", f"上傳檔案失敗: {e}")

    def add_video_link_row(self):
        """新增一列可輸入 YouTube 連結"""
        row = len(self.current_videos) + 100  # 避免跟圖片或其他元件衝突
        video_var = tk.StringVar()
        entry = ttk.Entry(self.form_frame, textvariable=video_var, width=50)
        entry.grid(row=row, column=1, sticky="w", pady=2)
        ttk.Button(self.form_frame, text="🗑", command=lambda: self.remove_video_entry(entry, video_var)).grid(row=row, column=2)

        self.current_videos.append(video_var)


    def remove_image(self, path):
        """移除指定的圖片（包含實體檔案 + JSON 路徑），並重新更新畫面"""
        try:
            full_path = os.path.join(self.base_dir, path)
            if os.path.exists(full_path):
                os.remove(full_path)
            if path in self.current_images:
                self.current_images.remove(path)
            items = self.get_section_items(self.current_section)
            items[self.selected_item_index]["images"] = self.current_images.copy()
            self.set_section_items(self.current_section, items)
            self.populate_form()
        except Exception as e:
            messagebox.showerror("錯誤", f"移除圖片失敗: {e}")

    def remove_file(self, path):
        """移除指定的檔案（包含實體檔案 + JSON 路徑），並重新更新畫面"""
        try:
            full_path = os.path.join(self.base_dir, path)
            if os.path.exists(full_path):
                os.remove(full_path)
            if path in self.current_files:
                self.current_files.remove(path)
            items = self.get_section_items(self.current_section)
            items[self.selected_item_index]["files"] = self.current_files.copy()
            self.set_section_items(self.current_section, items)
            self.populate_form()
        except Exception as e:
            messagebox.showerror("錯誤", f"移除檔案失敗: {e}")

    def remove_video_entry(self, entry, var):
        """移除影片輸入列"""
        entry.destroy()
        self.current_videos.remove(var)

    def export_text_with_red(self, text_widget):
        """將 Text widget 內容轉為 HTML，將紅字區段以 <span style='color:red'> ... </span> 包住"""
        full_text = text_widget.get("1.0", "end-1c")
        # 取得紅字區間，tag_ranges("red") 會回傳一個 index 的 tuple
        red_ranges = []
        ranges = text_widget.tag_ranges("red")
        for i in range(0, len(ranges), 2):
            # 以 "1.0" 為起點，計算到該 index 的文字數（返回 tuple, 取第一個值）
            start_count = text_widget.count("1.0", ranges[i])
            end_count = text_widget.count("1.0", ranges[i+1])
            if not start_count or not end_count:
                continue
            start_offset = start_count[0]
            end_offset = end_count[0]
            red_ranges.append((start_offset, end_offset))
        # 根據 red_ranges 重建文字（以 HTML 格式標記紅字）
        result = ""
        last_idx = 0
        for start, end in red_ranges:
            # 插入非紅字部分
            result += full_text[last_idx:start]
            # 插入紅字部分包入 span
            result += "<span style='color:red'>" + full_text[start:end] + "</span>"
            last_idx = end
        result += full_text[last_idx:]
        return result.replace("\n", "<br>")

    def insert_content_with_red(self, html):
        """將 HTML 中的 <span style='color:red'> 文字轉成文字並加上紅色 tag"""
        self.content_text.delete("1.0", tk.END)
        # 提前設定 tag，必須在每次操作前設定一次
        self.content_text.tag_config("red", foreground="red")
        
        # 處理換行
        html = html.replace("<br>", "\n")
        # 允許冒號後有空格，例如 "color: red"
        pattern = re.compile(r"<span style=['\"]color\s*:\s*red['\"]>(.*?)</span>", re.IGNORECASE)
        pos = 0
        while True:
            match = pattern.search(html, pos)
            if not match:
                break
            before = html[pos:match.start()]
            red_text = unescape(match.group(1))
            # 插入非紅字部分
            self.content_text.insert(tk.END, unescape(before))
            # 取得紅字部分插入前的正確位置
            red_start_index = self.content_text.index("end-1c")
            self.content_text.insert(tk.END, red_text)
            red_end_index = self.content_text.index("end-1c")
            self.content_text.tag_add("red", red_start_index, red_end_index)
            pos = match.end()
        # 插入剩餘文字
        self.content_text.insert(tk.END, unescape(html[pos:]))
        self.content_text.update_idletasks()  # 強制刷新 widget

    def save_json(self):
        """把目前表單內的資料（文字欄位、圖片與檔案列表）寫入 data.json 中對應的項目，並整個重新存檔至硬碟"""
        if self.selected_item_index is not None and self.current_section:
            items = self.get_section_items(self.current_section)
            if 0 <= self.selected_item_index < len(items):
                item = items[self.selected_item_index]
                if self.title_entry:
                    item["title"] = self.title_entry.get().strip()
                if self.content_text:
                    item["content"] = self.export_text_with_red(self.content_text).strip()
                if self.date_entry:
                    item["date"] = self.date_entry.get().strip() or None  # 空字串轉為 None
                if self.tags_entry:
                    tags = [tag.strip() for tag in self.tags_entry.get().split(",") if tag.strip()]
                    item["tags"] = tags
                item["images"] = self.current_images.copy()
                item["files"] = self.current_files.copy()
                item["videos"] = [v.get().strip() for v in self.current_videos if v.get().strip()]
                self.set_section_items(self.current_section, items)
                self.populate_items()

        json_path = os.path.join(self.base_dir, "data.json")
        try:
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(self.data, f, ensure_ascii=False, indent=4)
            messagebox.showinfo("完成", "已儲存至原始資料夾。")
        except Exception as e:
            messagebox.showerror("錯誤", f"儲存失敗: {e}")

    def start_drag(self, event):
        """使用者滑鼠按下時，記住目前項目的索引"""
        self.drag_start_index = self.item_listbox.nearest(event.y)

    def do_drag(self, event):
        """使用者拖動滑鼠時，如果移動到其他項目，就交換順序"""
        if self.drag_start_index is None:
            return
        cur_index = self.item_listbox.nearest(event.y)
        items = self.get_section_items(self.current_section)
        if not (0 <= cur_index < len(items) and 0 <= self.drag_start_index < len(items)):
            return
        if cur_index != self.drag_start_index:
            items[self.drag_start_index], items[cur_index] = items[cur_index], items[self.drag_start_index]
            self.set_section_items(self.current_section, items)
            self.populate_items()
            self.item_listbox.selection_set(cur_index)
            self.drag_start_index = cur_index
            self.on_item_select()

    def end_drag(self, event):
        """拖曳結束，重設拖曳狀態"""
        self.drag_start_index = None

if __name__ == "__main__":
    root = tk.Tk()
    root.geometry("650x800")
    root.iconbitmap('logo.ico') 
    app = JSONEditorApp(root)
    app.start() 
    root.mainloop()
