import json
import requests
import uuid

USER_FILE = r"json\users.json"
KEEP_FILE = r"json\keep.json"

class Keep():
    def access_token():
        with open(KEEP_FILE, "r", encoding="utf-8") as a:
            data = json.load(a)
            return data["Messaging_api"]["ACCESS_TOKEN"]
        
    def channel_id():
        with open(KEEP_FILE, "r", encoding="utf-8") as a:
            data = json.load(a)
            return data["Line_login"]["channel_id"]
    
    def channel_secret():
        with open(KEEP_FILE, "r", encoding="utf-8") as a:
            data = json.load(a)
            return data["Line_login"]["channel_secret"]
        
    def url():
        with open(KEEP_FILE, "r", encoding="utf-8") as a:
            data = json.load(a)
            return data["URL"]

def send_push_message(user_id, messages):
    url = "https://api.line.me/v2/bot/message/push"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {str(Keep.access_token())}",
        "X-Line-Retry-Key": str(uuid.uuid4())
    }
    payload = {
        "to": user_id,
        "messages": messages
    }
    response = requests.post(url, headers=headers, json=payload)
    return response.status_code, response.text

def check_done_the_goal(grip_value):
    if grip_value >= 3.0:
        return "你已完成今日目標，繼續加油！"
    else:
        return "你已經很努力了，明天再接再厲！"

def send_grip_data(device_id, grip_value):
    """根據裝置 ID 發送握力訊息給對應 userId"""
    try:
        with open(USER_FILE, "r", encoding="utf-8") as f:
            users = json.load(f)
    except FileNotFoundError:
        return "找不到使用者資料"

    target = next((u for u in users if u.get("deviceId") == device_id), None)
    if not target:
        return f"找不到對應的裝置 ID: {device_id}"

    user_id = target["userId"]
    message = {
        "type": "text",
        "text": f"今日握力紀錄：{grip_value} kg，{check_done_the_goal(grip_value)}"
    }
    status, response = send_push_message(user_id, [message])
    return f"已發送給 {user_id}：{status}, {response}"

if __name__ == "__main__":
    print("這裡是自薦函式庫，你點錯了，請使用 app.py 發送資料測試")
