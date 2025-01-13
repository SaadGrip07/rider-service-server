import { sql, RMDBConnect } from "../database/RMDB.js";

// Define the Rider Detail model
const CreateOrdersDetailTable = async () => {
  await RMDBConnect; // Ensure database is connected

  const checkTableQuery = `
    SELECT * FROM sysobjects WHERE name='OrdersDetail' and xtype='U';
  `;

  const createTableQuery = `
    CREATE TABLE OrdersDetail (
        OID INT PRIMARY KEY,                             -- Order ID
        OInvN NVARCHAR(50),                              -- Order Invoice Number
        ODH NVARCHAR(255),                               -- Order Delivery Hint
        ODate NVARCHAR(15),                              -- Order Date
        OTime NVARCHAR(15),                              -- Order Time
        OGSTA NVARCHAR(50),                              -- Order GST Amount
        ODSC NVARCHAR(50),                               -- Order Delivery Service Charges
        ONetA NVARCHAR(50),                              -- Order Net Amount
        OGSTPercP NVARCHAR(50),                          -- Order GST Percentage Paid
        OGSTPaidA NVARCHAR(50),                          -- Order GST Paid Amount
        OPMethod NVARCHAR(50),                           -- Order Payment Method
        OPCBAP NVARCHAR(50),                             -- Order Payment Cleard By Admin Portal Person Name
        OPS NVARCHAR(50),                                -- Order Payment Status
        CFN NVARCHAR(50),                                -- Customer Full Name
        CCN NVARCHAR(30),                                -- Customer Contact Number
        ODAddress NVARCHAR(255),                         -- Order Delivery Address
        OAddressT NVARCHAR(50),                          -- Address Type
        DTime NVARCHAR(15),                              -- Delivery Time
        DDate NVARCHAR(15),                              -- Delivery Date
        DCLALO NVARCHAR(255),                            -- Delivery Coordinates (Latitude, Longitude)
        OStatus NVARCHAR(50),                            -- Order Status (Pending, Delivered, New,etc.)
        RFN NVARCHAR(50),                                -- Rider Full Name
        RUID NVARCHAR(50),                               -- Rider Unique ID
        ODTDuration NVARCHAR(15),                        -- Order Delivery Total Duration (in minutes)
        ODDistance NVARCHAR(100),                        -- Order Delivery Distance (in kilometers)
        DeliveryFuelConsumption DECIMAL(10, 2),          -- Fuel Consumption (in liters)
        DFBFCustomer NVARCHAR(255),                      -- Delivery Feedback from Customer
        ORQ NVARCHAR(MAX)                                -- Order Report Query or other relevant info
        OCleared NVARCHAR(10),                           -- Order Cleared
    );
`;

  try {
    const request = new sql.Request();
    const result = await request.query(checkTableQuery);

    if (result.recordset.length > 0) {
      console.log('Table "OrdersDetail" already exists.');
    } else {
      await request.query(createTableQuery);
      console.log('Table "OrdersDetail" has been created.');
    }
  } catch (err) {
    console.error("Error creating table:", err);
  }
};

export default CreateOrdersDetailTable;