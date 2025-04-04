import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from PIL import Image, ImageTk
import json
import os
import shutil
import uuid
import threading
from deep_translator import GoogleTranslator

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
        self.populate_sections()

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

    def save_translation_cache(self):
        """儲存快取檔到 data.json 所在資料夾"""
        cache_path = os.path.join(self.base_dir, "translation_cache.json")
        try:
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump(self.translation_cache, f, ensure_ascii=False, indent=4)
        except Exception as e:
            print(f"快取儲存失敗: {e}")

    def update_combobox_values(self, new_values):
        self.section_combobox["values"] = new_values

    def translate_sections(self, sections):
        """非同步翻譯每個 section，並使用快取"""
        if not hasattr(self, 'translation_cache'):
            self.translation_cache = {}
        new_values = []
        updated = False
        for sec in sections:
            if sec in self.translation_cache:
                translation = self.translation_cache[sec]
            else:
                try:
                    translation = translator.translate(sec)
                except Exception as e:
                    translation = "翻譯錯誤"
                self.translation_cache[sec] = translation
                updated = True
            new_values.append(f"{sec} ({translation})")
        self.root.after(0, self.update_combobox_values, new_values)
        if updated:
            self.save_translation_cache()

    def build_ui(self):
        """建立UI介面"""
        self.root.grid_columnconfigure(0, weight=1)
        self.root.grid_rowconfigure(1, weight=1)

        section_frame = ttk.Frame(self.root)
        section_frame.grid(row=0, column=0, sticky="ew", padx=5, pady=5)
        ttk.Label(section_frame, text="選擇目錄:").pack(side=tk.LEFT)
        self.section_var = tk.StringVar()
        self.section_combobox = ttk.Combobox(section_frame, textvariable=self.section_var, state="readonly")
        self.section_combobox.pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
        self.section_combobox.bind("<<ComboboxSelected>>", self.on_section_change)

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

    def populate_sections(self):
        """找出 JSON 中所有「list 結構」的欄位路徑，顯示在下拉選單中"""
        sections = self.get_all_sections(self.data)
        self.section_combobox["values"] = sections
        if sections:
            self.section_combobox.current(0)
            self.current_section = sections[0]
            self.populate_items()
        threading.Thread(target=self.translate_sections, args=(sections,), daemon=True).start()

    def populate_items(self):
        """根據 current_section，從 JSON 裡取出該陣列的所有項目，顯示標題在 Listbox 裡"""
        if not self.current_section:
            return
        items = self.get_section_items(self.current_section)
        self.item_listbox.delete(0, tk.END)
        for item in items:
            self.item_listbox.insert(tk.END, item.get("title", "無標題"))

    def get_all_sections(self, data, prefix=""):
        """遞迴掃描 data 所有層級，只要發現 list，就記下對應路徑"""
        sections = []
        if isinstance(data, dict):
            for key, value in data.items():
                current_path = f"{prefix}/{key}" if prefix else key
                if isinstance(value, list):
                    sections.append(current_path)
                elif isinstance(value, dict):
                    sections.extend(self.get_all_sections(value, current_path))
        return sections

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

    def populate_sections(self):
        """找出 JSON 中所有「list 結構」的欄位路徑，顯示在下拉選單中"""
        sections = self.get_all_sections(self.data)
        self.original_sections = sections
        self.section_combobox["values"] = sections
        if sections:
            self.section_combobox.current(0)
            self.current_section = sections[0]
            self.populate_items()
        threading.Thread(target=self.translate_sections, args=(sections,), daemon=True).start()

    def on_section_change(self, event=None):
        """
        當使用者從下拉選單選擇不同 section 時，
        依據下拉選單目前的索引從 self.original_sections 取得正確的原始路徑，
        再更新項目列表與表單內容
        """
        index = self.section_combobox.current()
        if index >= 0 and hasattr(self, 'original_sections'):
            self.current_section = self.original_sections[index]
            self.populate_items()
            self.clear_form()

    def on_item_select(self, event=None):
        """使用者點選某個項目時，更新 selected_item_index，並呼叫 populate_form() 顯示對應資料"""
        selection = self.item_listbox.curselection()
        if selection:
            self.selected_item_index = selection[0]
            self.populate_form()

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
        self.content_text.insert("1.0", item.get("content", ""))

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

        ttk.Button(self.form_frame, text="新增圖片", command=self.upload_image).grid(row=4, column=1, sticky=tk.W, pady=5)
        ttk.Button(self.form_frame, text="新增檔案", command=self.upload_file).grid(row=5, column=1, sticky=tk.W, pady=5)

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

    def add_item(self):
        """在目前 section 的陣列尾端加上一個預設的新項目，並自動選取它進入編輯"""
        if not self.current_section:
            return
        items = self.get_section_items(self.current_section)
        items.append({"title": "新項目", "content": "", "images": [], "files": [], "date": "", "tags": []})
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

    def save_json(self):
        """把目前表單內的資料（文字欄位、圖片與檔案列表）寫入 data.json 中對應的項目，並整個重新存檔至硬碟"""
        if self.selected_item_index is not None and self.current_section:
            items = self.get_section_items(self.current_section)
            if 0 <= self.selected_item_index < len(items):
                item = items[self.selected_item_index]
                if self.title_entry:
                    item["title"] = self.title_entry.get().strip()
                if self.content_text:
                    item["content"] = self.content_text.get("1.0", tk.END).strip()
                if self.date_entry:
                    item["date"] = self.date_entry.get().strip() or None  # 空字串轉為 None
                if self.tags_entry:
                    tags = [tag.strip() for tag in self.tags_entry.get().split(",") if tag.strip()]
                    item["tags"] = tags
                item["images"] = self.current_images.copy()
                item["files"] = self.current_files.copy()
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
    root.geometry("600x800")
    app = JSONEditorApp(root)
    app.start()
    root.mainloop()
