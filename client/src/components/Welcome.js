import { HashRouter, BrowserRouter, Route, Link } from "react-router-dom";
import Registration from "./Registration";
import Login from "./Login";
import Map from "./Map";

export default function Welcome() {
    return (
        <BrowserRouter>
            <header className="appHeader">
                <Link to="/"> Login </Link>
                <Link to="/registration"> Register </Link>
                <Link to="/map"> Map </Link>
            </header>
            <Route path="/map" exact>
                <Map></Map>
            </Route>
            <main>
                <section className="app">
                    <section className="appContent">
                        <Route path="/" exact>
                            <Login></Login>
                        </Route>
                        <Route path="/registration">
                            <Registration />
                        </Route>
                        <Route path="/hello">
                            <h1>Hello</h1>
                        </Route>
                    </section>
                </section>
            </main>
        </BrowserRouter>
    );
}
