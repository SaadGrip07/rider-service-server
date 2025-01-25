import { sql, RMDBConnect } from "../database/RMDB.js";

// Define the AdminPortalDetails model
const createAdminPortalDetailsTable = async () => {
  await RMDBConnect; // Ensure database is connected

  const checkTableQuery = `
    SELECT * FROM sysobjects WHERE name='AdminPortalDetails' and xtype='U';
  `;

  const createTableQuery = `
    CREATE TABLE AdminPortalDetails (
      ID INT NOT NULL,                           -- INT ID Auto Increament 1
      UFN NVARCHAR(100) NOT NULL,                -- User Full Name
      UP NVARCHAR(50) NOT NULL,                  -- User Password
      UUID NVARCHAR(50) NOT NULL,                -- User Unique ID
      UAT NVARCHAR(255),                         -- User Auth Token
      UAOrders NVARCHAR(50) NOT NULL,            -- Can User Assign Orders (true/false)
      CUOUManagement NVARCHAR(50) NOT NULL,      -- Can User Open User Management (true/false)
      CUORManagement NVARCHAR(50) NOT NULL,      -- Can User Open Rider Management (true/false)
      UType NVARCHAR(50) NOT NULL,               -- User Type
      CUCPayments NVARCHAR(50) NOT NULL,         -- Can User Clear Payments (true/false)
      CUORidesR NVARCHAR(50) NOT NULL,           -- Can User Open Rides Record (true/false)
      CUORTraking NVARCHAR(50) NOT NULL          -- Can User Open Riders Tracking (true/false)
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
