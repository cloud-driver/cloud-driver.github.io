# -*- coding: utf-8 -*-
import secrets
from google.genai import Client
from google.genai import types
from flask import Flask, request, render_template
import os

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
app.secret_key = secrets.token_hex(16)

API_KEY = "AIzaSyC72Bw38usXWc6w8CSARBccvOuvFlcZ9YY"
CLIENT = Client(api_key=API_KEY)

@app.route("/")
def home():
    return render_template('index.html')

@app.route("/answer")
def login_redirect():
    question = request.args.get("question")
    if not question:
        return "請輸入問題！", 400

    response = CLIENT.models.generate_content(
        model="gemini-2.5-flash", contents=f"用純文字回答我{question}", config=types.GenerateContentConfig(thinking_config=types.ThinkingConfig(thinking_budget=0))
    )
    
    return render_template('answer.html', question=question, response=response.text)

@app.route("/healthz")
def health():
    return "ok", 200

@app.errorhandler(404)
def page_not_found(error):
    return render_template("404.html") , 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))    