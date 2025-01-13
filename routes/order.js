import express from "express";
import { sql, RMDBConnect } from "../database/RMDB.js";

const router = express.Router();

/////////////////
// Create Order API with OrderItems
router.post("/create-order", async (req, res) => {
  const {
    OrderID,
    InvoiceNumber,
    DeliveryHint,
    OrderDate,
    OrderTime,
    OrderGSTAmount,
    OrderDeliveryServiceCharges,
    OrderNetAmount,
    OrderGSTPercentagePaid,
    OrderGSTPaidAmount,
    OrderPaymentMethod,
    CustomerFullName,
    CustomerContactNumber,
    OrderDeliveryAddress,
    AddressType,
    OrderStatus,
    OrderItems, // Array of items
  } = req.body;

  // Validate the incoming data
  if (
    !OrderID ||
    !InvoiceNumber ||
    !CustomerFullName ||
    !OrderDeliveryAddress ||
    !OrderItems ||
    OrderItems.length === 0
  ) {
    return res
      .status(400)
      .json({ message: "Missing required fields or items" });
  }

  try {
    await RMDBConnect;
    const request = new sql.Request();

    // Step 1: Validate Order
    const checkOrderQuery = `SELECT * FROM OrdersDetail WHERE OID = @OrderID;`;
    request.input("OrderID", sql.Int, OrderID);
    const orderCheckResult = await request.query(checkOrderQuery);

    if (orderCheckResult.recordset.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "This Order ID already Exist" });
    }
    // Insert Order into Orders table
    const orderQuery = `
      INSERT INTO OrdersDetail (
        OID, OInvN, ODH, ODate, OTime,
        OGSTA, ODSC, ONetA, OGSTPercP, OGSTPaidA,
        OPMethod, CFN, CCN, ODAddress, OAddressT,
        OStatus
      ) VALUES (
       @OrderID, @InvoiceNumber, @DeliveryHint, @OrderDate, @OrderTime,
        @OrderGSTAmount, @OrderDeliveryServiceCharges, @OrderNetAmount,
        @OrderGSTPercentagePaid, @OrderGSTPaidAmount, @OrderPaymentMethod,
        @CustomerFullName, @CustomerContactNumber, @OrderDeliveryAddress,
        @AddressType,
        @OrderStatus
      );
    `;

    request.input("InvoiceNumber", sql.NVarChar(50), InvoiceNumber);
    request.input("DeliveryHint", sql.NVarChar(255), DeliveryHint || "No Hint");
    request.input("OrderDate", sql.NVarChar(15), OrderDate);
    request.input("OrderTime", sql.NVarChar(15), OrderTime);
    request.input("OrderGSTAmount", sql.NVarChar(50), OrderGSTAmount);
    request.input(
      "OrderDeliveryServiceCharges",
      sql.NVarChar(50),
      OrderDeliveryServiceCharges
    );
    request.input("OrderNetAmount", sql.NVarChar(50), OrderNetAmount);
    request.input(
      "OrderGSTPercentagePaid",
      sql.NVarChar(50),
      OrderGSTPercentagePaid
    );
    request.input("OrderGSTPaidAmount", sql.NVarChar(50), OrderGSTPaidAmount);
    request.input("OrderPaymentMethod", sql.NVarChar(50), OrderPaymentMethod);
    request.input("CustomerFullName", sql.NVarChar(50), CustomerFullName);
    request.input(
      "CustomerContactNumber",
      sql.NVarChar(30),
      CustomerContactNumber
    );
    request.input(
      "OrderDeliveryAddress",
      sql.NVarChar(255),
      OrderDeliveryAddress
    );
    request.input("AddressType", sql.NVarChar(50), AddressType);
    request.input("OrderStatus", sql.NVarChar(50), OrderStatus);

    await request.query(orderQuery);

    // Insert each item into the OrderItems table
    for (let item of OrderItems) {
      const itemQuery = `
        INSERT INTO OrdersItemsDetail (
          OID, OItemDesc, ItemQty, ItemRate, ItemAmount
        ) VALUES (
          @OrderID, @ItemDescription, @ItemQuantity, @ItemRate, @ItemAmount
        );
      `;

      const itemRequest = new sql.Request();
      itemRequest.input("OrderID", sql.Int, OrderID);
      itemRequest.input(
        "ItemDescription",
        sql.NVarChar(255),
        item.ItemDescription
      );
      itemRequest.input("ItemQuantity", sql.Int, item.ItemQuantity);
      itemRequest.input("ItemRate", sql.Decimal(10, 2), item.ItemRate);
      itemRequest.input("ItemAmount", sql.Decimal(10, 2), item.ItemAmount);

      await itemRequest.query(itemQuery);
    }

    // Respond with success message and the OrderID
    res.status(201).json({
      message: "Order created successfully",
      OrderID,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res
      .status(500)
      .json({ message: "Error creating order", error: err.message });
  }
});
////////////////////////////////////////////////

// Get Orders By Rider ID
router.get('/orders-for-delivery', async (req, res) => {
  const { riderId } = req.query;

  if (!riderId) {
      return res.status(400).json({ success:false,message: 'Rider ID is required.' });
  }

  try {
      const request = new sql.Request();
      request.input('RiderID', sql.NVarChar, riderId);

      const query = `
          SELECT 
              OID AS OrderID, 
              OInvN AS InvoiceNumber, 
              ODate AS OrderDate, 
              OTime AS OrderTime, 
              ODSC AS OrderDeliveryCharges,
              OGSTA AS OrderGSTAmount,   
              ONetA AS OrderNetAmount,
              OGSTPercP AS OrderGSTPercentage,
              OGSTPaidA AS OrderGSTPaidAmount,
              OStatus AS OrderStatus, 
              CFN AS CustomerName, 
              CCN AS ContactNumber, 
              ODAddress AS DeliveryAddress, 
              ODH AS DeliveryHint
          FROM OrdersDetail
          WHERE RUID = @RiderID AND OCleared='No'
      `;

      const result = await request.query(query);
      const orders = result.recordset;

        if (orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Ooops No Order Found for You!" });
    }
      

      for (const order of orders) {
          order.Items = await fetchItemsByOrderId(order.OrderID);
      }

      res.json({success: true,data:orders});
  } catch (err) {
      console.error('Error fetching orders by status:', err);
      res.status(500).json({ success:false,message: 'Oops Server Side Error!' });
  }
});


// Utility function to fetch items by OrderID
const fetchItemsByOrderId = async (orderId) => {
  const request = new sql.Request();
  request.input('orderId', sql.Int, orderId);

  const query = `
      SELECT 
          OID AS OrderID, 
          OItemDesc AS ItemDescription, 
          ItemQty AS ItemQuantity, 
          ItemRate AS ItemRate, 
          ItemAmount AS ItemAmount
      FROM OrdersItemsDetail
      WHERE OID = @orderId
  `;

  const result = await request.query(query);
  return result.recordset; // Array of items
};

// 1. Assign Order to Rider
router.put('/orders/assign', async (req, res) => {
  const { orderId, riderId } = req.query;

  if (!orderId || !riderId) {
    return res.status(400).json({ success: false, message: 'OrderID and RiderID are required.' });
  }

  try {
    const request = new sql.Request();

    // Check if the OrderID exists
    const checkOrderQuery = `SELECT OStatus FROM OrdersDetail WHERE OID = @orderId`;
    request.input('orderId', sql.Int, orderId);

    const orderResult = await request.query(checkOrderQuery);

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Order ID not found.' });
    }

    // Validate the order status
    const orderStatus = orderResult.recordset[0].OStatus;
    if (orderStatus !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Order is not in a Pending state.' });
    }

    // Update the Order with the RiderID and set status to 'Assigned'
    request.input('riderId', sql.Int, riderId);

    const assignOrderQuery = `
      UPDATE OrdersDetail
      SET RUID = @riderId, OStatus = 'Assigned'
      WHERE OID = @orderId
    `;

    await request.query(assignOrderQuery);

    res.json({ success: true, message: 'Order assigned to rider successfully.' });
  } catch (err) {
    console.error('Error assigning order to rider:', err);
    res.status(500).json({ success: false, message: 'Oops Server Side Error!' });
  }
});



// 2. Get All Orders (Working)
router.get('/orders-all', async (req, res) => {
  try {
      const query = `
          SELECT 
              OID AS OrderID, 
              OInvN AS InvoiceNumber, 
              OStatus AS Status, 
              CFN AS CustomerName, 
              CCN AS ContactNumber, 
              ODAddress AS DeliveryAddress, 
              DDate AS DeliveryDate, 
              DTime AS DeliveryTime, 
              RFN AS RiderName, 
              RUID AS RiderID
          FROM OrdersDetail
      `;

      const result = await new sql.Request().query(query);
      const orders = result.recordset;

      for (const order of orders) {
          order.Items = await fetchItemsByOrderId(order.OrderID);
      }

      res.json({success:true,data:orders});
  } catch (err) {
      console.error('Error fetching all orders:', err);
      res.status(500).json({ success:false,message: 'Oops Server Side Error!' });
  }
});

// 3. Get Orders by Status (Working)
router.get('/orders-status', async (req, res) => {
  const { status } = req.query;

  if (!status) {
      return res.status(400).json({ success:false,message: 'Status is required.' });
  }

  try {
      const request = new sql.Request();
      request.input('status', sql.NVarChar, status);

      const query = `
          SELECT 
              OID AS OrderID, 
              OInvN AS InvoiceNumber, 
              OStatus AS Status, 
              CFN AS CustomerName, 
              CCN AS ContactNumber, 
              ODAddress AS DeliveryAddress, 
              DDate AS DeliveryDate, 
              DTime AS DeliveryTime, 
              RFN AS RiderName, 
              RUID AS RiderID
          FROM OrdersDetail
          WHERE OStatus = @status
      `;

      const result = await request.query(query);
      const orders = result.recordset;

        if (orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Ooops Invalid Status!" });
    }
      

      for (const order of orders) {
          order.Items = await fetchItemsByOrderId(order.OrderID);
      }

      res.json({success: true,data:orders});
  } catch (err) {
      console.error('Error fetching orders by status:', err);
      res.status(500).json({ success:false,message: 'Oops Server Side Error!' });
  }
});

// 4. Get Orders by OrderID (Working)
router.get('/orders-byId', async (req, res) => {
  const { orderId } = req.query;
  if (!orderId) {
    return res.status(400).json({ success:false, message: 'OrderId is required.' });
}

  try {
      const request = new sql.Request();
      request.input('orderId', sql.Int, orderId);

      const query = `
          SELECT 
              OID AS OrderID, 
              OInvN AS InvoiceNumber, 
              OStatus AS Status, 
              CFN AS CustomerName, 
              CCN AS ContactNumber, 
              ODAddress AS DeliveryAddress, 
              DDate AS DeliveryDate, 
              DTime AS DeliveryTime, 
              RFN AS RiderName, 
              RUID AS RiderID
          FROM OrdersDetail
          WHERE OID = @orderId
      `;

      const result = await request.query(query);
      const order = result.recordset[0];

      if (!order) {
          return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      order.Items = await fetchItemsByOrderId(order.OrderID);

      res.json({success: true, data:order});
  } catch (err) {
      console.error('Error fetching order by OrderID:', err);
      res.status(500).json({ success:false, message: 'Oops Server Side Error!' });
  }
});

// 5. Get Orders by Invoice Number (Working)
router.get('/orders-byInvoiceNumber', async (req, res) => {
  const { invoiceNumber } = req.query;

  if (!invoiceNumber) {
    return res.status(400).json({ success:false, message: 'invoiceNumber is required.' });
}

  try {
      const request = new sql.Request();
      request.input('invoiceNumber', sql.NVarChar, invoiceNumber);

      const query = `
          SELECT 
              OID AS OrderID, 
              OInvN AS InvoiceNumber, 
              OStatus AS Status, 
              CFN AS CustomerName, 
              CCN AS ContactNumber, 
              ODAddress AS DeliveryAddress, 
              DDate AS DeliveryDate, 
              DTime AS DeliveryTime, 
              RFN AS RiderName, 
              RUID AS RiderID
          FROM OrdersDetail
          WHERE OInvN = @invoiceNumber
      `;

      const result = await request.query(query);
      const order = result.recordset[0];

      if (!order) {
          return res.status(404).json({ success:false,message: 'Oops no Order Found for this Invoice Number!' });
      }

      order.Items = await fetchItemsByOrderId(order.OrderID);

      res.json({success:true,data:order});
  } catch (err) {
      console.error('Error fetching order by Invoice Number:', err);
      res.status(500).json({ success:false, message: 'Oops Server Side Error!' });
  }
});

// 6. Get Orders by Rider ID (Working)
router.get('/orders-byRiderUID', async (req, res) => {
  const { riderUID } = req.query;

  if (!riderUID) {
    return res.status(400).json({ success:false, message: 'riderUID is required.' });
}

  try {
      const request = new sql.Request();
      request.input('riderUID', sql.NVarChar, riderUID);

      const query = `
          SELECT 
              OID AS OrderID, 
              OInvN AS InvoiceNumber, 
              OStatus AS Status, 
              CFN AS CustomerName, 
              CCN AS ContactNumber, 
              ODAddress AS DeliveryAddress, 
              DDate AS DeliveryDate, 
              DTime AS DeliveryTime, 
              RFN AS RiderName, 
              RUID AS RiderUID
          FROM OrdersDetail
          WHERE RUID = @riderUID
      `;

      const result = await request.query(query);
      const orders = result.recordset;
      if (orders.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Ooops No Order Found for This Rider!" });
      }

      for (const order of orders) {
          order.Items = await fetchItemsByOrderId(order.OrderID);
      }

      res.json({success:true,data:orders});
  } catch (err) {
      console.error('Error fetching orders by Rider ID:', err);
      res.status(500).json({ success:false, message: 'Oops Server Side Error!' });
  }
});

export default router;