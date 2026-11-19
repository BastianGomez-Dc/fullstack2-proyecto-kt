import { lazy, Suspense } from "react";
import { Route, Router, Switch } from "wouter";
import Header from "./components/organisms/Header";
import RequireAuth from "./components/templates/RequireAuth";
import Home from "./pages/home/Home";

// La portada va en el paquete inicial; el resto de las páginas se descarga al visitarlas
const Login = lazy(() => import("./pages/login/Login"));
const Register = lazy(() => import("./pages/register/Register"));
const Cursos = lazy(() => import("./pages/cursos/Cursos"));
const Notifications = lazy(() => import("./pages/notifications/Notifications"));
const NotFound = lazy(() => import("./pages/not-found/NotFound"));

const base = import.meta.env.BASE_URL.replace(/\/$/, "") || "";

const App = () => (
  <Router base={base}>
    <a className="saltar-contenido" href="#contenido">Saltar al contenido</a>
    <Header />
    <Suspense fallback={<main id="contenido" className="pagina-cargando" aria-busy="true" />}>
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
    </Suspense>
  </Router>
);

export default App;
