import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export const server = process.env.REACT_APP_SERVER;

export function Login() {
    const [create, setCreate] = useState("block");
    const [ask, setAsk] = useState("create");

    return (
        <>
            <div className="text-3l font-bold accent-lime-500 text-center flex justify-around">
                <input
                    type="radio"
                    name="room"
                    defaultChecked
                    onClick={() => {
                        setCreate("block");
                        setAsk("create");
                    }}
                />
                <label>Create Room</label>
                <input
                    type="radio"
                    name="room"
                    onClick={() => {
                        setCreate("block");
                        setAsk("join");
                    }}
                />
                <label>Join Room</label>
                <input
                    type="radio"
                    name="room"
                    onClick={() => {
                        setCreate("none");
                        setAsk("random");
                    }}
                />
                <label>Join Random Room</label>
            </div>
            <CreateorJoin create={create} ask={ask} />
        </>
    );
}

function CreateorJoin({ create, ask }) {
    const navigate = useNavigate();
    const [roomid, setRoomid] = useState("");
    const [username, setUsername] = useState("");
    const [err, setErr] = useState(["", "none"]);

    return (
        <div className="p-2 font-mono text-center m-2 font-semibold">
            <h4 className="p-2">
                Enter Username:{" "}
                <input
                    className="border-t-2 border-b-2 border-l-2 border-r-2 border-black font-normal"
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                    maxLength={30}
                />
            </h4>
            <h4 style={{ display: create }} className="p-2">
                Enter Room id:{" "}
                <input
                    className="border-t-2 border-b-2 border-l-2 border-r-2 border-black font-normal"
                    onChange={(e) => setRoomid(e.target.value)}
                    value={roomid}
                    type="number"
                />
            </h4>
            <h4 style={{ display: err[1] }} className="text-red-600">
                {err[0]}
            </h4>
            <button
                className="border-t-2 border-b-2 border-l-2 border-r-2 border-black rounded-full p-2 mt-5"
                type="submit"
                onClick={() => {
                    if (roomid.toString().startsWith("0")) {
                        setErr(["Roomid must not start with 0", "block"]);
                    } else if (ask !== "random") {
                        username && roomid
                            ? handleSumbit(
                                  ask,
                                  roomid,
                                  username,
                                  setErr,
                                  navigate
                              )
                            : setErr(["Enter Username and Roomid", "block"]);
                    } else {
                        username
                            ? handleSumbit(
                                  ask,
                                  roomid,
                                  username,
                                  setErr,
                                  navigate
                              )
                            : setErr(["Enter Username", "block"]);
                    }
                }}
            >
                Submit
            </button>
        </div>
    );
}

function handleSumbit(ask, roomid, username, setErr, navigate) {
    if (ask === "create") {
        const admin = true;
        async function myFunction() {
            try {
                const arr = await getAllrooms();

                if (!arr.includes(parseInt(roomid))) {
                    handleJoin(username, roomid, navigate, admin);
                    setErr(["", "none"]);
                } else {
                    setErr(["Roomid already exists", "block"]);
                }
            } catch (error) {
                console.error(error);
            }
        }
        myFunction();
    } else if (ask === "join") {
        const admin = false;
        async function myFunction() {
            try {
                const arr = await getAllrooms();

                if (arr.includes(parseInt(roomid))) {
                    navigate("/message", {
                        state: [username, roomid, admin],
                    });
                    setErr(["", "none"]);
                } else {
                    setErr(["Roomid does not exists", "block"]);
                }
            } catch (error) {
                console.error(error);
            }
        }
        myFunction();
    } else if (ask === "random") {
        const admin = false;
        async function myFunction() {
            try {
                const arr = await getAllrooms();

                if (arr.length !== 0) {
                    const randomIndex = Math.floor(Math.random() * arr.length);
                    const randomElement = arr[randomIndex];

                    navigate("/message", {
                        state: [username, randomElement, admin],
                    });
                    setErr(["", "none"]);
                } else {
                    setErr(["No room exists", "block"]);
                }
            } catch (error) {
                console.error(error);
            }
        }
        myFunction();
    }
}

async function getAllrooms() {
    try {
        const res = await axios.get(`${server}/get/allrooms`);
        const arr = [...res.data];
        return arr;
    } catch (error) {
        console.error(error);
        return [];
    }
}

function handleJoin(username, roomid, navigate, admin) {
    axios
        .post(`${server}/post/create`, {
            username: username,
            roomid: roomid,
        })
        .then((res) => {
            navigate("/message", { state: [username, roomid, admin] });
        })
        .catch((err) => console.log(err));
}
