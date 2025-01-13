import sql from "mssql";
import dotenv from "dotenv";

//Load Enviroment Varibles
dotenv.config();



// Configuration for the SQL Server connection
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT, 10),
    database: process.env.DB_DATABASE,
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
}



// Create a connection pool and export it
const RMDBConnect = sql.connect(config)
  .then(async (db) => {
    if (db.connected) {
      console.log('Connected to SQL Server');
        // Switch to 'SFADB' database
        await db.request().query("USE SRMDB");
   
    }else{
      console.log("Can't Connect");
    }
    return db;
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

  export {sql, RMDBConnect}