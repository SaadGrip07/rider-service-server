import { sql, RMDBConnect } from "../database/RMDB.js";

// Define the Rider Detail model
const createRidersDetailTable = async () => {
  await RMDBConnect; // Ensure database is connected

  const checkTableQuery = `
    SELECT * FROM sysobjects WHERE name='RidersDetail' and xtype='U';
  `;

  const createTableQuery = `
  CREATE TABLE RidersDetail (
      ID INT IDENTITY(1,1) PRIMARY KEY,       -- Auto-incremented ID
      RUID NVARCHAR(50),                      -- Rider Unique ID
      RAT NVARCHAR(100),                      -- Rider Auth Token
      RFCMT NVARCHAR(100),                    -- Rider FCM Token
      PIOR NVARCHAR(255),                     -- Profile Image Of Rider
      RFN NVARCHAR(255) NOT NULL,             -- Rider Full Name
      RE NVARCHAR(255) NOT NULL,              -- Rider Email
      MN NVARCHAR(50) NOT NULL,               -- Mobile Number
      AMN NVARCHAR(50),                       -- Alternative Mobile Number
      CNIC NVARCHAR(20) NOT NULL,             -- CNIC Number
      DOB NVARCHAR(15) NOT NULL,              -- Date Of Birth
      DOI NVARCHAR(15) NOT NULL,              -- Date Of Issue
      ACNIC NVARCHAR(255) NOT NULL,           -- Address at CNIC
      CA NVARCHAR(255) NOT NULL,              -- Current Address
      RP NVARCHAR(255) NOT NULL,              -- Rider Password
      CNICFI NVARCHAR(255),                   -- CNIC Front Image
      CNICBI NVARCHAR(255),                   -- CNIC Back Image
      RBG NVARCHAR(10),                       -- Rider Blood Group
      BNWA NVARCHAR(100),                     -- Branch Name Where Applying
      RHLicense NVARCHAR(10),                 -- Rider Have License
      LNUM NVARCHAR(150),                     -- License No
      LDOI NVARCHAR(15),                      -- License Date Of Issue
      LDOE NVARCHAR(15),                      -- License Date Of Exp
      LFI NVARCHAR(255),                      -- License Front Image
      LBI NVARCHAR(255),                      -- License Back Image
      RHBike NVARCHAR(10),                    -- Rider Have Bike
      BName NVARCHAR(100),                    -- Bike Name
      BNumber NVARCHAR(20),                   -- Bike Number
      BMY NVARCHAR(15),                       -- Bike Model Year
      BFI NVARCHAR(255),                      -- Bike Front Image
      BBI NVARCHAR(255),                      -- Bike Back Image
      BLI NVARCHAR(255),                      -- Bike Left Image
      BRI NVARCHAR(255),                      -- Bike Right Image
      UT NVARCHAR(50),                        -- User Type
      JDR NVARCHAR(50),                       -- Joining Date for Rider
      EMSR NVARCHAR(50),                      -- Employment Status Of Rider
      RCS NVARCHAR(50),                       -- Rider Current Status
      RLCLALO NVARCHAR(150),                  -- Rider Location Coordinates (Latitude & Logitude)
      RSD NVARCHAR(15),                       -- Registration Submit Date
      URD NVARCHAR(15),                       -- Update Record Date
      DCB NVARCHAR(100),                      -- Details Checked By
      AT NVARCHAR(100),                       -- Action Taken
      ATB NVARCHAR(100),                      -- Action Taken By
  );
`;

  try {
    const request = new sql.Request();
    const result = await request.query(checkTableQuery);

    if (result.recordset.length > 0) {
      console.log('Table "RidersDetail" already exists.');
    } else {
      await request.query(createTableQuery);
      console.log('Table "RidersDetail" has been created.');
    }
  } catch (err) {
    console.error("Error creating table:", err);
  }
};

export default createRidersDetailTable;