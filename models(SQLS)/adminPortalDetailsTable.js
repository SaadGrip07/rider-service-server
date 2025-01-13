import { sql, RMDBConnect } from "../database/RMDB.js";

// Define the AdminPortalDetails model
const createAdminPortalDetailsTable = async () => {
  await RMDBConnect; // Ensure database is connected

  const checkTableQuery = `
    SELECT * FROM sysobjects WHERE name='AdminPortalDetails' and xtype='U';
  `;

  const createTableQuery = `
    CREATE TABLE AdminPortalDetails (
      ID INT NOT NULL,                            -- INT ID Auto Increament 1
      UFN NVARCHAR(100) NOT NULL,                 -- User Full Name
      UP NVARCHAR(50) NOT NULL,                   -- User Password
      UUID INT NOT NULL PRIMARY KEY,              -- User Unique ID
      UAT NVARCHAR(255),                          -- User Auth Token
      CUAOR BIT NOT NULL DEFAULT 0,               -- Can User Assign Orders (true/false)
      CUOR BIT NOT NULL DEFAULT 0,                -- Can User Open Reports (true/false)
      CUTAFR BIT NOT NULL DEFAULT 0,              -- Can User Take Action For Rider (true/false)
      CUCRD BIT NOT NULL DEFAULT 0,               -- Can User Change Rider Details (true/false)
      UT NVARCHAR(50) NOT NULL,                   -- User Type
      CUCP BIT NOT NULL DEFAULT 0,                -- Can User Clear Payments (true/false)
      CUCFC BIT NOT NULL DEFAULT 0,               -- Can User Calculate Fuel Consumption (true/false)
      CUGRLLC BIT NOT NULL DEFAULT 0              -- Can User Get Rider Live Location Coordinates (true/false)
    );
  `;

  try {
    const request = new sql.Request();
    const result = await request.query(checkTableQuery);

    if (result.recordset.length > 0) {
      console.log('Table "AdminPortalDetails" already exists.');
    } else {
      await request.query(createTableQuery);
      console.log('Table "AdminPortalDetails" has been created.');
    }
  } catch (err) {
    console.error("Error creating table:", err);
  }
};

export default createAdminPortalDetailsTable;
