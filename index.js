const express = require("express");

const app = express();

app.use(express.json());

const admin = require("firebase-admin");

const serviceAccount = require("./accountService.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://santiago-e2e07.firebaseio.com",
});

const port = 3000;

const getAuthToken = (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    req.authToken = req.headers.authorization.split(" ")[1];
  } else {
    req.authToken = null;
  }
  next();
};

const checkIfAuthenticated = (req, res, next) => {
  getAuthToken(req, res, async () => {
    try {
      const { authToken } = req;

      const userInfo = await admin.auth().verifyIdToken(authToken);

      req.authId = userInfo.uid;
      return next();
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .send({ error: "You are not authorized to make this request" });
    }
  });
};

app.post("/authorize", (req, res) => {
  res.status(200).json({
    message: "Todo bien",
    headers: req.headers,
    body: req.body,
  });
});

app.post(
  "/secure/authorize",
  getAuthToken,
  checkIfAuthenticated,
  (req, res) => {
    res.json({
      Bodega: 35,
      autorizado: 40,
    });
  }
);

// CALLBACK
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
