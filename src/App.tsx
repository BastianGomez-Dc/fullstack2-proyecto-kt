import { Route, Router, Switch } from "wouter";
import Header from "./components/organisms/Header";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import NotFound from "./pages/not-found/NotFound";
import Cursos from "./pages/cursos/Cursos";
import Notifications from "./pages/notifications/Notifications";
import Register from "./pages/register/Register";
import RequireAuth from "./components/templates/RequireAuth";

const base = import.meta.env.BASE_URL.replace(/\/$/, "") || "";

// Solo composición: encabezado común + rutas. Cada página pone su <main id="contenido">.
const App = () => (
  <Router base={base}>
    <a className="saltar-contenido" href="#contenido">Saltar al contenido</a>
    <Header />
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/cursos">
        <RequireAuth><Cursos /></RequireAuth>
      </Route>
      <Route path="/notifications">
        <RequireAuth><Notifications /></RequireAuth>
      </Route>
      <Route component={NotFound} />
    </Switch>
  </Router>
);

export default App;
