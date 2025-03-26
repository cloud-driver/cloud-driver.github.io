import json
import os
import requests
import secrets
import jwt as pyjwt
from flask import Flask, request, redirect, jsonify, session, send_from_directory

from send import send_grip_data, Keep

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

CLIENT_ID = int(Keep.channel_id())
CLIENT_SECRET = str(Keep.channel_secret())
REDIRECT_URI = str(Keep.url())
USER_FILE = r"json\users.json"

@app.route("/")
def home():
    return '''
    <html>
    <head>
        <meta charset="UTF-8">
        <title>LINE 裝置綁定登入</title>
        <style>
            body {
                font-family: "Microsoft JhengHei", sans-serif;
                background: linear-gradient(to right, #74ebd5, #acb6e5);
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .container {
                background-color: white;
                padding: 40px;
                border-radius: 15px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                text-align: center;
                width: 350px;
            }
            h1 {
                margin-bottom: 20px;
                color: #333;
            }
            label {
                display: block;
                margin-bottom: 10px;
                font-size: 16px;
                color: #555;
            }
            input[type="text"] {
                width: 100%;
                padding: 10px;
                border-radius: 8px;
                border: 1px solid #ccc;
                margin-bottom: 20px;
            }
            button {
                background-color: #00c300;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            button:hover {
                background-color: #00a000;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>請登入 LINE 並綁定裝置</h1>
            <form action="/login" method="GET">
                <label for="device_id">裝置 ID：</label>
                <input type="text" name="device_id" required>
                <button type="submit">登入 LINE</button>
            </form>
        </div>
    </body>
    </html>
    '''


@app.route("/login")
def login_redirect():
    device_id = request.args.get("device_id")
    if not device_id:
        return "請提供裝置 ID", 400

    state = secrets.token_hex(16)
    session['oauth_state'] = state
    session['device_id'] = device_id

    login_url = (
        f"https://access.line.me/oauth2/v2.1/authorize"
        f"?response_type=code"
        f"&client_id={CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&scope=openid%20profile"
        f"&state={state}"
    )
    return redirect(login_url)

def save_user_device(user_id, device_id):
    if os.path.exists(USER_FILE):
        with open(USER_FILE, "r", encoding="utf-8") as f:
            users = json.load(f)
    else:
        users = []

    for user in users:
        if user["userId"] == user_id:
            user["deviceId"] = device_id
            break
    else:
        users.append({"userId": user_id, "deviceId": device_id})

    with open(USER_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=4)

@app.route("/callback")
def callback():
    code = request.args.get("code")
    state = request.args.get("state")
    device_id = session.get("device_id")

    if not state or state != session.get("oauth_state"):
        print(token_response.text)
        return "驗證失敗，state 不一致", 400

    token_url = "https://api.line.me/oauth2/v2.1/token"
    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    token_response = requests.post(token_url, data=payload, headers=headers)

    if token_response.status_code != 200:
        return "無法獲取 Access Token", 400

    token_data = token_response.json()
    id_token = token_data.get("id_token")
    decoded = pyjwt.decode(id_token, options={"verify_signature": False}, algorithms=["HS256"])
    user_id = decoded.get("sub")
    display_name = decoded.get("name", "未知")

    save_user_device(user_id, device_id)

    return """
        <html>
            <head>
                <meta charset="UTF-8">
                <title>登入完成</title>
                <style>
                    body {
                        font-family: "Microsoft JhengHei", sans-serif;
                        background: linear-gradient(to right, #74ebd5, #acb6e5);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    .container {
                        background-color: white;
                        padding: 40px;
                        border-radius: 15px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                        text-align: center;
                        width: 350px;
                    }
                    h1 {
                        margin-bottom: 20px;
                        color: #333;
                    }
                    label {
                        display: block;
                        margin-bottom: 10px;
                        font-size: 16px;
                        color: #555;
                    }
            </style>
            </head>
            <body>
                <div class="container">
                <h1>已完成登入</h1>
                <p>您可以關閉此網頁了。</p>
            </div>
            </body>
        </html>
    """

@app.route("/users")
def get_users():
    if os.path.exists(USER_FILE):
        with open(USER_FILE, "r", encoding="utf-8") as f:
            users = json.load(f)
    else:
        users = []
    return jsonify(users)

@app.route("/gripdata", methods=["POST"])
def grip_data():
    data = request.get_json()
    device_id = data.get("device_id")
    grip = data.get("grip")

    if not device_id or grip is None:
        return "缺少 device_id 或 grip", 400

    result = send_grip_data(device_id, grip)
    return jsonify({"result": result})

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico', mimetype='image/vnd.microsoft.icon')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
