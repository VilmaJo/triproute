import { HashRouter, Route, Link } from "react-router-dom";
import Registration from "./Registration";
import Login from "./Login";

export default function Welcome() {
    return (
        <HashRouter>
            <div className="welcome">
                <h1 className="mainHeading">Amazing Trip Routes</h1>
                <img src="./assets/map.png" alt="Globe Image"></img>

                <Route path="/" exact>
                    <Login />
                    <p>
                        <Link to="/registration">Go to registration</Link>
                    </p>
                </Route>
                <Route path="/registration">
                    <Registration />
                    <p>
                        <Link to="/">Go to login</Link>
                    </p>
                </Route>
                <Route path="/hello">
                    <h1>Hello</h1>
                </Route>
            </div>
        </HashRouter>
    );
}
