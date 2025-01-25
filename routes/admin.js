import express from 'express';
import { sql, RMDBConnect } from "../database/RMDB.js";

const router = express.Router();


// Admin Login(Rider Admin) ✅
router.post('/admin-login', async (req, res) => {
    const { userName, password } = req.body;

        // Check for required fields
        const missingFields = [];
        if (!userName) missingFields.push('userName');
        if (!password) missingFields.push('password');
    
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }
  
    await RMDBConnect;
    try {
      const request = new sql.Request();
  
      // Check if the user exists
      const result = await request.query(`SELECT * FROM AdminPortalDetails WHERE UFN = '${userName}'`);
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: "User Does Not Exist." });
      }


    // Validate password
    const admin = result.recordset[0];
    // Check Password
      if (admin.UP !== password) {
        return res.status(401).json({ message: "Invalid Password" });
      }
        // Generate a new JWT token
        const payload = { userId: rider.RUID ,role:rider.UT};
        const token = generateAuthToken(payload);
  
      res.json({
        success: true,
        message: "Login successful",
        AuthToken: token,
        data: {
          RUID: rider.RUID,
          RProfileImage: rider.PIOR,
          RFullName: rider.RFN,
          REmail: rider.RE,
          RMobileNumber: rider.MN,
          RiderCNIC: rider.CNIC
        },
      });
    } catch (err) {
        console.log(err );
      res.status(500).json({success:false, message: "Oops Server Side Error!"});
    }
  });
export default router;