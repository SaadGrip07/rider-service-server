import { sql, RMDBConnect } from "../database/RMDB.js";

// Define the ProjectDetails model
const createBranchesDetailTable = async () => {
  await RMDBConnect; // Ensure database is connected

  const checkTableQuery = `
    SELECT * FROM sysobjects WHERE name='BranchesDetail' and xtype='U';
  `;

  const createTableQuery = `
    CREATE TABLE BranchesDetail (
        ID INT PRIMARY KEY,                    -- Auto-incremented ID
        BN NVARCHAR(100) NOT NULL,             -- Branch Name
        BCA NVARCHAR(MAX) NOT NULL,            -- Branch Complete Address
        BID NVARCHAR(50) NOT NULL,             -- Branch ID
        BL NVARCHAR(255),                      -- Branch Logo
        BNTN NVARCHAR(100),                    -- Branch NTN
        BFBQRC NVARCHAR(255),                  -- Branch Feed Back QR Code
        BLA NVARCHAR(255),                     -- Branch Location Area
        BWVer NVARCHAR(50),                    -- Web Version
        BAAppVer NVARCHAR(50),                 -- Android App Version
        BIOSAppVer NVARCHAR(50),               -- IOS App Version
        BExeVer NVARCHAR(50),                  -- EXE Version
        BCreatedAt NVARCHAR(50),                -- Record Creation Date
        BUpdatedAt NVARCHAR(50)                 -- Last Updated Date
    );
  `;

  try {
    const request = new sql.Request();
    const result = await request.query(checkTableQuery);

    if (result.recordset.length > 0) {
      console.log('Table "BranchesDetail" already exists.');
    } else {
      await request.query(createTableQuery);
      console.log('Table "BranchesDetail" has been created.');
    }
  } catch (err) {
    console.error("Error creating table:", err);
  }
};

export default createBranchesDetailTable;