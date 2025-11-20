import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1 style={{ fontSize: "4rem", color: "red" }}>404</h1>
            <p>¡Ups! La página que buscas no existe.</p>
            <Link to="/">
                <button style={{ marginTop: "20px" }}>Volver al Inicio</button>
            </Link>
        </div>
    );
}