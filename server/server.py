from flask import Flask, jsonify, request
from flask_cors import CORS
import time
from sqlite3 import connect
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

rooms = connect("rooms.db", check_same_thread=False)
rooms.execute(
    "CREATE TABLE IF NOT EXISTS room(room_id INT PRIMARY KEY, create_by varchar(30), create_on varchar(20))"
)
messages = connect("messages.db", check_same_thread=False)


@app.route("/post/create", methods=["POST", "GET"])
def createroom():
    data = request.get_json()
    t = time.ctime()

    rooms.execute(
        "INSERT INTO room VALUES (?, ?, ?)", (data["roomid"], data["username"], t)
    )

    messages.execute(
        f"CREATE TABLE IF NOT EXISTS room{data['roomid']} (username varchar(30), message varchar(1000000), sent_time varchar(20))"
    )

    rooms.commit()
    return "Room created."


@app.route("/get/messages", methods=["POST", "GET"])
def getMessages():
    data = request.get_json()
    cursor = rooms.execute("SELECT * FROM room")
    check = False
    for i in cursor.fetchall():
        if int(data["roomid"]) in i:
            check = True
    if not check:
        socketio.emit("message", ["ERR"])
        return ["ERR"]
    cursor = messages.execute(f"SELECT * FROM room{data['roomid']}")
    results = cursor.fetchall()
    res = []
    for row in results:
        message = {"id": row[0], "text": row[1], "time": row[2]}
        res.append(message)

    return jsonify(res)


@socketio.on("message")
def socket_message(data):
    cursor = rooms.execute("SELECT * FROM room")
    check = False
    for i in cursor.fetchall():
        if int(data["roomid"]) in i:
            check = True
    if not check:
        socketio.emit("message", ["ERR"])
        return
    messages.execute(
        f"INSERT INTO room{data['roomid']} values('{data['username']}', '{data['msg']}', '{time.ctime()}')"
    )
    messages.commit()
    results = messages.execute(f"SELECT * FROM room{data['roomid']}")
    res = []
    for row in results:
        message = {"id": row[0], "text": row[1], "time": row[2]}
        res.append(message)
    socketio.emit("message", res)


@app.route("/get/allrooms")
def getallrooms():
    results = rooms.execute("SELECT room_id FROM room")
    res = results.fetchall()
    k = [i[0] for i in res]
    return k


@app.route("/get/roomdetails", methods=["POST", "GET"])
def getroomdetails():
    data = request.get_json()
    res = rooms.execute("SELECT * FROM room WHERE room_id=(?)", (data["roomid"],))
    k = [i for i in res.fetchall()]
    return k


@app.route("/delete/room", methods=["POST", "GET"])
def deleteroom():
    data = request.get_json()
    rooms.execute("DELETE FROM room WHERE room_id=(?)", (data["roomid"],))
    rooms.commit()
    messages.execute(f"DROP TABLE room{data['roomid']}")
    messages.commit()
    return "Deleted"


if __name__ == "__main__":
    socketio.run(app, debug=True, port=8000)
