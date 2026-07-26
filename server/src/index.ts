import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import multer from "multer";
import FormData from "form-data";

dotenv.config();

const app = express();
const PORT = 5000;
const FASTAPI_URL = "http://127.0.0.1:8000";
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Express server is running!" });
});

// Upload PDF → forward to FastAPI
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(`${FASTAPI_URL}/upload`, formData, {
      headers: formData.getHeaders(),
    });

    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Ask question → forward to FastAPI
app.post("/ask", async (req, res) => {
  try {
    const { question, collection_name } = req.body;
    const response = await axios.post(`${FASTAPI_URL}/ask`, {
      question,
      collection_name: collection_name || "default",
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});