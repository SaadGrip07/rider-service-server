import { sql, RMDBConnect } from "../database/RMDB.js";

// Define the Rider Detail model
const CreateOrdersItemsDetailTable = async () => {
  await RMDBConnect; // Ensure database is connected

  const checkTableQuery = `
    SELECT * FROM sysobjects WHERE name='OrdersItemsDetail' and xtype='U';
  `;

  const createTableQuery = `
    CREATE TABLE OrdersItemsDetail (
      OID INT,                                              -- Associated Order ID
      OItemDesc NVARCHAR(255),                              -- Item Description
      ItemQty INT,                                          -- Item Quantity
      ItemRate INT,                                         -- Item Rate
      ItemAmount INT,                                       -- Item Amount
      FOREIGN KEY (OID) REFERENCES OrdersDetail(OID)        -- Reference to Orders table
    );
`;

  try {
    const request = new sql.Request();
    const result = await request.query(checkTableQuery);

    if (result.recordset.length > 0) {
      console.log('Table "OrdersItemsDetail" already exists.');
    } else {
      await request.query(createTableQuery);
      console.log('Table "OrdersItemsDetail" has been created.');
    }
  } catch (err) {
    console.error("Error creating table:", err);
  }
};

export default CreateOrdersItemsDetailTable;