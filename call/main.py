from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('join')
def on_join(room):
    join_room(room)
    # 通知房間內其他人：有新人(request.sid)加入
    emit('user-connected', request.sid, to=room, include_self=False)

@socketio.on('disconnect')
def on_disconnect():
    # 通知所有人：有人離開
    emit('user-disconnected', request.sid, broadcast=True)

# 以下是點對點信令轉發 (Signal Relaying)
@socketio.on('offer')
def on_offer(data):
    emit('offer', {
        'offer': data['offer'],
        'from': request.sid
    }, to=data['to'])

@socketio.on('answer')
def on_answer(data):
    emit('answer', {
        'answer': data['answer'],
        'from': request.sid
    }, to=data['to'])

@socketio.on('candidate')
def on_candidate(data):
    emit('candidate', {
        'candidate': data['candidate'],
        'from': request.sid
    }, to=data['to'])

if __name__ == '__main__':
    # 建議用 host='0.0.0.0' 讓區網也能連
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)