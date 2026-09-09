import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import webRoutes from "./api/v1/web";
import swaggerUi from "swagger-ui-express";
import swaggerJsDocsWeb from "./config/swagger/swagger-config-web";

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Serve static assets from public folder
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: false,
  }),
);




// Mount versioned API routes
app.use("/api/v1", webRoutes);

app.use("/web-api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJsDocsWeb));

export default app;


