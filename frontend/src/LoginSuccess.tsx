import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function LoginSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            localStorage.setItem("token", token);
        }
        navigate("/");
    }, [searchParams, navigate]);

    return <div style={{ padding: "2rem" }}>Logging in...</div>;
}

export default LoginSuccess;