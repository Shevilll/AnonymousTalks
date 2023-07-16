import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "./Login";
import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io(server);

export default function Messagebox() {
    const navigate = useNavigate();
    const location = useLocation();
    const [username, roomid, admin] = location.state;
    const [messages, setMessages] = useState([]);
    const [roomdetails, setRoomdetails] = useState(["", "", ""]);
    useEffect(() => {
        getMessages(roomid, setMessages);
        getRoomdetails(roomid, setRoomdetails);
    }, [roomid]);
    useEffect(() => {
        socket.on("message", (data) => {
            setMessages(data);
        });
        return () => {
            socket.off("message");
        };
    }, []);
    try {
        return (
            <>
                <div className="text-center underline">
                    <p>RoomId: {roomdetails[0][0]}</p>
                    <p>{roomdetails[0][1]}'s room</p>
                    <p>Created on: {roomdetails[0][2]}</p>

                    <button
                        className="border-t-2 border-b-2 border-l-2 border-r-2 border-black rounded-full p-0.5 mt-1"
                        onClick={() => {
                            if (admin) {
                                deleteroom(roomid);
                            }
                            navigate("/");
                        }}
                    >
                        {admin ? "Delete Room" : "Exit"}
                    </button>
                </div>
                <div className="border-t-2 border-b-2 border-l-2 border-r-2 border-black rounded-2xl p-0.5 m-2 pl-2 pr-2 pt-2 min-h-[30vh]">
                    {messages.map((message, i) => (
                        <div key={i} className="flex items-center gap-1">
                            <label className="font-serif">
                                {`${message.id}:`}
                            </label>
                            <label>{message.text}</label>
                            <label className="ml-auto text-xs">
                                {message.time}
                            </label>
                        </div>
                    ))}
                </div>
                <TextBox roomid={roomid} username={username} />
            </>
        );
    } catch {
        return (
            <>
                <div className="text-xl font-bold text-center">
                    <h1>Room has been deleted by admin.</h1>
                    <button
                        className="border-t-2 border-b-2 border-l-2 border-r-2 border-black rounded-full p-0.5 mt-1"
                        onClick={() => navigate("/")}
                    >
                        Exit
                    </button>
                </div>
            </>
        );
    }
}

function getRoomdetails(roomid, setRoomdetails) {
    axios
        .post(`${server}/get/roomdetails`, { roomid: roomid })
        .then((res) => {
            setRoomdetails(res.data);
        })
        .catch((err) => console.log(err));
}

function getMessages(roomid, setMessages) {
    axios
        .post(`${server}/get/messages`, { roomid: roomid })
        .then((res) => {
            // console.log(res);
            setMessages(res.data);
        })
        .catch((err) => console.log(err));
}

function TextBox({ roomid, username }) {
    const [inputValue, setInputValue] = useState("");

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    return (
        <div className="flex m-2">
            <textarea
                className="border border-solid border-slate-950 rounded-lg pl-2 pr-2 w-[100vw]"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={`Enter your message as ${username}`}
            />
            <button
                className="border-t-2 border-b-2 border-l-2 border-r-2 rounded-xl border-black p-0.1 ml-2 pl-2 pr-2"
                onClick={() => {
                    sendMessage(roomid, username, inputValue);
                    setInputValue("");
                }}
            >
                Send
            </button>
        </div>
    );
}

function sendMessage(roomid, username, msg) {
    if (msg.trim()) {
        const message = {
            roomid: roomid,
            username: username,
            msg: msg,
        };
        socket.emit("message", message);
    }
}

function deleteroom(roomid) {
    axios.post(`${server}/delete/room`, { roomid: roomid });
}
