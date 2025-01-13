import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";
import { RMDBConnect } from "./database/RMDB.js";
// Tables Path
import createAdminPortalDetailsTable from "./models(SQLS)/adminPortalDetailsTable.js";
import createBranchesDetailTable from "./models(SQLS)/branchesDetailTable.js";
import createOrdersDetailTable from "./models(SQLS)/ordersDetailTable.js";
import createOrdersItemsDetailTable from "./models(SQLS)/ordersItemsDetailTable.js";
import createRidersDetailTable from "./models(SQLS)/ridersDetailTable.js";
import createRidesDetailTable from "./models(SQLS)/ridesDetailTable.js";
// Routes Path
import adminRoutes from "./routes/admin.js";
import orderRoutes from "./routes/order.js";
import riderRoutes from "./routes/rider.js";
import ridesRoutes from "./routes/rides.js";


//app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON
app.use(bodyParser.json());


// Routes Initial Points
app.use("/api", adminRoutes);
app.use("/api", orderRoutes);
app.use("/api", riderRoutes);
app.use("/api", ridesRoutes);


// Load environment variables
dotenv.config();

// Create an HTTP server
const server = http.createServer(app);

// Create a WebSocket server
const wss = new WebSocketServer({ server }); // Attach WebSocket to the existing HTTP server

// Start the server
const startServer = async () => {
  try {
    // Database Connect
    await RMDBConnect;

    // >>> Create Tables in SQL Server Database <<<
    // Admin Portal Table
    await createAdminPortalDetailsTable();
    // Branch Details Table
    await createBranchesDetailTable();
    // Branch Details Table
    await createOrdersDetailTable();
    // Branch Details Table
    await createOrdersItemsDetailTable();
    // Rider Details Table
    await createRidersDetailTable();
    // Rides Record Table
    await createRidesDetailTable();

    const port = process.env.PORT || 80; // Default HTTP port

    server.listen(port, () => {
      console.log(`HTTP Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Error starting server:", err);
  }
};

startServer();