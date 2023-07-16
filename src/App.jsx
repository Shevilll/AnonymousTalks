import { Login } from "./Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Messagebox from "./messages";
export default function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <>
                                <div className="font-bold text-center text-2xl underline pb-5 pt-2">
                                    <h1>Anonymous Talks</h1>
                                </div>
                                <Login />
                            </>
                        }
                    ></Route>
                    <Route
                        path="/message"
                        element={
                            <>
                                <div className="font-bold text-center text-2xl underline pb-5 pt-2">
                                    <h1>Message</h1>
                                </div>
                                <Messagebox />
                            </>
                        }
                    ></Route>
                </Routes>
            </Router>
        </>
    );
}
