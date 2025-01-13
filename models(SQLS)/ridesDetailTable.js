import { sql, RMDBConnect } from "../database/RMDB.js";

// Define the RiderTrips model
const createRidesDetailTable = async () => {
  await RMDBConnect; // Ensure database is connected

  const checkTableQuery = `
    SELECT * FROM sysobjects WHERE name='RidesDetail' and xtype='U';
  `;

  const createTableQuery = `
    CREATE TABLE RidesDetail (
        ID INT IDENTITY(1,1) PRIMARY KEY,       -- Auto-incremented ID
        RN NVARCHAR(50) NOT NULL,               -- Ride Number
        RID NVARCHAR(50) NOT NULL,              -- Ride ID
        RSD NVARCHAR(50) NOT NULL,              -- Ride Start Date
        RED NVARCHAR(50),                       -- Ride End Date
        RFN NVARCHAR(255) NOT NULL,             -- Rider Full Name
        RUID NVARCHAR(50) NOT NULL,             -- Rider UID
        RAF NVARCHAR(255) NOT NULL,             -- Ride Assign From
        RST NVARCHAR(50) NOT NULL,              -- Ride Start Time
        RET NVARCHAR(50),                       -- Ride End Time
        RTT NVARCHAR(50),                       -- Ride Total Time
        OSIDS NVARCHAR(MAX) NOT NULL,           -- Orders ID'S (comma-separated)
        TOS INT NOT NULL,                       -- Total Orders
        TA FLOAT NOT NULL,                      -- Total Amount
        ITDQ INT,                               -- In Time Delivered Quantity
        LDQ INT,                                -- Late Delivered Quantity
        RDKM FLOAT,                             -- Ride Distance in KM
        RSLALO NVARCHAR(255) NOT NULL,          -- Ride Start Latitude, Longitude
        RELALO NVARCHAR(255),                   -- Ride End Latitude, Longitude
        RS NVARCHAR(50),                        -- Ride Status
        RFCA FLOAT                              -- Ride Fuel Consumption Amount
    );
  `;

  try {
    const request = new sql.Request();
    const result = await request.query(checkTableQuery);

    if (result.recordset.length > 0) {
      console.log('Table "RidesDetail" already exists.');
    } else {
      await request.query(createTableQuery);
      console.log('Table "RidesDetail" has been created.');
    }
  } catch (err) {
    console.error("Error creating table:", err);
  }
};

export default createRidesDetailTable;