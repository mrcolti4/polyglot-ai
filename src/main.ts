import express from "express";
import admin, { credential, firestore } from "firebase-admin";

const app = express();

app.use(express.json());

const { GOOGLE_APPLICATION_CREDENTIALS } = process.env;

admin.initializeApp({
  credential: credential.cert(GOOGLE_APPLICATION_CREDENTIALS || ""),
});

const db = firestore();

app.listen(3000, () => {
  console.log("Application is running on port 3000");
});

app.get("/", async (req, res) => {
  res.send("BODY");
});

app.get("/:id", async (req, res) => {
  console.log(req.params.id);
});

app.post("/create", async (req, res) => {
  const { firstName, lastName } = req.body;

  const response = await db
    .collection("test")
    .doc()
    .set({ firstName, lastName });

  res.send(response);
});
