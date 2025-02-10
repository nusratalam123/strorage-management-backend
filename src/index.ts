import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import connectDB from "./config/db";
import secrets from "./config/secret";
import middleware from "./shared/middleware";
import routes from "./shared/route";
import logger from "node-color-log";
import http from "http";
import { initializeSocketIO } from "./utils/socket";

const app = express();
const PORT = secrets.PORT;

const httpServer = http.createServer(app);

// Initialize Socket.IO
initializeSocketIO(httpServer);

app.get("/", async (_, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the API",
  });
});

// implement middleware
app.use(middleware); 

// database connection
connectDB(); 

app.use("/api/v1", routes); 

// catch global error
app.use((error: any, _req: Request, res: Response, _: NextFunction) => {
  logger
    .color("red")
    .bgColor("black")
    .bold()
    .dim()
    .reverse()
    .log(error.message);

  res.status(error.statusCode || 400).json({
    message: error.message,
  });
});

// app.listen(PORT, () => {
//   console.log(`Listening on port ${PORT}`);
// });


// Start the server
httpServer.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
});

export default app;
