import express from "express";
import cors from "cors";

const app = express();
const PORT = 4000;

app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello API");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});