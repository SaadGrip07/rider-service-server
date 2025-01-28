import express from 'express';
import multer from 'multer';
import { sql, RMDBConnect } from "../database/RMDB.js";
import cloudinary from '../cloudinary/cloudinaryConfigFile.js';
import generateAuthToken from '../utils/authTokenGenerate.js';


// Router Instance
const router = express.Router();


// Set up multer storage configuration ✅
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true); // Accept the file
        } else {
            cb(new Error('Only JPG, JPEG, and PNG files are allowed.'), false); // Reject the file
        }
    }
}).fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'cnicFrontImage', maxCount: 1 },
  { name: 'cnicBackImage', maxCount: 1 },
  { name: 'licenseFrontImage', maxCount: 1 },
  { name: 'licenseBackImage', maxCount: 1 },
  { name: 'bikeFrontImage', maxCount: 1 },
  { name: 'bikeBackImage', maxCount: 1 },
  { name: 'bikeLeftImage', maxCount: 1 },
  { name: 'bikeRightImage', maxCount: 1 },
]);

// Method to upload images to Cloudinary only if the image exists ✅
const uploadToCloudinary = (fileBuffer, folder, fileName) => {
    return new Promise((resolve, reject) => {
        if (!fileBuffer || !fileBuffer.length) {
            // Return No-Image if file is missing or empty
            resolve({ secure_url: 'No-Image' });
            return;
        }

        const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto', folder, public_id: fileName },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result); // Return the Cloudinary result (URL)
                }
            }
        );
        stream.end(fileBuffer);
    });
};

// Rider registration API (Rider App) ✅
router.post('/rider-register', upload, async (req, res) => {
    const { fullName, email, mobileNumber, altMobileNumber, cnicNumber, cnicAddress,currentAddress,
         dob, doi,  password, riderBloodGroup,branchNameAF,registrationSubmitDate,
         riderHaveBike,
         bikeName, bikeNumber,bikeModelY, riderHaveLicense,licenseNo,licenseIssueDate,licenseExpDate
    } = req.body;

    // Get the uploaded files from the request
    const profileImage = req.files['profileImage'];
    const cnicFrontImage = req.files['cnicFrontImage'];
    const cnicBackImage = req.files['cnicBackImage'];
    const licenseFrontImage = req.files['licenseFrontImage'] ?? 'No-Image';
    const licenseBackImage = req.files['licenseBackImage'] ?? 'No-Image';
    const bikeFrontImage = req.files['bikeFrontImage']?? 'No-Image';
    const bikeBackImage = req.files['bikeBackImage']?? 'No-Image';
    const bikeLeftImage = req.files['bikeLeftImage']?? 'No-Image';
    const bikeRightImage = req.files['bikeRightImage']?? 'No-Image';

        // Step 1: Check for required fields
        const missingFields = [];
        if (!profileImage) missingFields.push('profileImage');
        if (!cnicFrontImage) missingFields.push('cnicFrontImage');
        if (!cnicBackImage) missingFields.push('cnicBackImage');
    
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }
        
    try {

        await RMDBConnect;
        const request = new sql.Request();

        // Step 2: Validate email
        const checkEmailQuery = `SELECT * FROM RidersDetail WHERE RE = @Email;`;
        request.input('Email', sql.NVarChar, email);
        const emailCheckResult = await request.query(checkEmailQuery);

        if (emailCheckResult.recordset.length > 0) {
            return res.status(400).json({ message: 'This email is already registered.' });
        }

        // Step 3: Validate phone number
        const checkPhoneQuery = `SELECT * FROM RidersDetail WHERE MN = @MobileNumber OR AMN = @MobileNumber;`;
        request.input('MobileNumber', sql.NVarChar, mobileNumber);
        const phoneCheckResult = await request.query(checkPhoneQuery);

        if (phoneCheckResult.recordset.length > 0) {
            return res.status(400).json({ message: 'This phone number is already registered.' });
        }

        // Step 4: Validate alternative mobile number
        const checkAltPhoneQuery = `SELECT * FROM RidersDetail WHERE MN = @AltMobileNumber OR AMN = @AltMobileNumber;`;
        request.input('AltMobileNumber', sql.NVarChar, altMobileNumber);
        const altPhoneCheckResult = await request.query(checkAltPhoneQuery);

        if (altPhoneCheckResult.recordset.length > 0) {
            return res.status(400).json({ message: 'Alternative mobile number is already registered.' });
        }

        // Step 5: Validate CNIC number
        const checkCNICQuery = `SELECT * FROM RidersDetail WHERE CNIC = @CnicNumber`;
        request.input('CnicNumber', sql.NVarChar, cnicNumber);
        const CNICCheckResult = await request.query(checkCNICQuery);

        if (CNICCheckResult.recordset.length > 0) {
            return res.status(400).json({ message: 'This CNIC number is already registered.' });
        }        
        // Upload images to Cloudinary
        const profileImageUpload = await uploadToCloudinary(profileImage[0].buffer, 'Riders/ProfileImages',`${cnicNumber}-profileImage`);
        const cnicFrontImageUpload = await uploadToCloudinary(cnicFrontImage[0].buffer, 'Riders/CNICImages',`${cnicNumber}-cnicFrontImage`);
        const cnicBackImageUpload = await uploadToCloudinary(cnicBackImage[0].buffer, 'Riders/CNICImages',`${cnicNumber}-cnicBackImage`);
        const licenseFrontImageUpload = await uploadToCloudinary(licenseFrontImage[0].buffer, 'Riders/LicenseImages',`${cnicNumber}-licenseFrontImage`);
        const licenseBackImageUpload = await uploadToCloudinary(licenseBackImage[0].buffer, 'Riders/LicenseImages',`${cnicNumber}-licenseBackImage`);
        const bikeFrontImageUpload = await uploadToCloudinary(bikeFrontImage[0].buffer, 'Riders/BikeImages',`${cnicNumber}-bikeFrontImage`);
        const bikeBackImageUpload = await uploadToCloudinary(bikeBackImage[0].buffer, 'Riders/BikeImages',`${cnicNumber}-bikeBackImage`);
        const bikeLeftImageUpload = await uploadToCloudinary(bikeLeftImage[0].buffer, 'Riders/BikeImages',`${cnicNumber}-bikeLeftImage`);
        const bikeRightImageUpload = await uploadToCloudinary(bikeRightImage[0].buffer, 'Riders/BikeImages',`${cnicNumber}-bikeRightImage`);


        // Step 6: Insert data into the database
        const insertQuery = `
            INSERT INTO RidersDetail (PIOR, RFN, RE, MN, AMN, CNIC, DOB, DOI, ACNIC, CA, RP, RBG, BNWA,CNICFI, CNICBI, LNUM, LDOI, LDOE, LFI, LBI, BName, BNumber, BMY, BFI, BBI, BLI, BRI, UT, EMSR,RSD,RHLicense,RHBike)
            VALUES (@ProfileImage, @FullName, @Email, @MobileNumber, @AltMobileNumber, @CnicNumber, @DOB, @DOI,  @CnicAddress, @CurrentAddress, @Password,@RiderBloodGroup, @BranchNameAF,
                    @CnicFrontImage, @CnicBackImage, @LicenseNo, @LicenseIssueDate, @LicenseExpDate, @LicenseFrontImage, @LicenseBackImage, @BikeName, @BikeNumber, @BikeModelY, @BikeFrontImage, @BikeBackImage, @BikeLeftImage, @BikeRightImage,'Rider', 'New-Registration',@RegistrationSubmitDate,@RiderHaveLicense,@RiderHaveBike);
        `;

        request.input('ProfileImage', sql.NVarChar, profileImageUpload.secure_url); // Cloudinary URL
        request.input('FullName', sql.NVarChar, fullName);
        request.input('DOB', sql.NVarChar, dob);
        request.input('DOI', sql.NVarChar, doi);
        request.input('CnicAddress', sql.NVarChar, cnicAddress);
        request.input('CurrentAddress', sql.NVarChar, currentAddress);
        request.input('Password', sql.NVarChar, password);
        request.input('RiderBloodGroup', sql.NVarChar, riderBloodGroup);
        request.input('BranchNameAF', sql.NVarChar, branchNameAF);
        request.input('RegistrationSubmitDate', sql.NVarChar, registrationSubmitDate);
        request.input('CnicFrontImage', sql.NVarChar, cnicFrontImageUpload.secure_url); // Cloudinary URL
        request.input('CnicBackImage', sql.NVarChar, cnicBackImageUpload.secure_url); // Cloudinary URL
        request.input('RiderHaveLicense', sql.NVarChar, riderHaveLicense);
        request.input('LicenseNo', sql.NVarChar, licenseNo);
        request.input('LicenseIssueDate', sql.NVarChar, licenseIssueDate);
        request.input('LicenseExpDate', sql.NVarChar, licenseExpDate);
        request.input('LicenseFrontImage', sql.NVarChar, licenseFrontImageUpload.secure_url); // Cloudinary URL
        request.input('LicenseBackImage', sql.NVarChar, licenseBackImageUpload.secure_url); // Cloudinary URL
        request.input('RiderHaveBike', sql.NVarChar, riderHaveBike);
        request.input('BikeName', sql.NVarChar, bikeName);
        request.input('BikeNumber', sql.NVarChar, bikeNumber);
        request.input('BikeModelY', sql.NVarChar, bikeModelY);
        request.input('BikeFrontImage', sql.NVarChar, bikeFrontImageUpload.secure_url); // Cloudinary URL
        request.input('BikeBackImage', sql.NVarChar, bikeBackImageUpload.secure_url); // Cloudinary URL
        request.input('BikeLeftImage', sql.NVarChar, bikeLeftImageUpload.secure_url); // Cloudinary URL
        request.input('BikeRightImage', sql.NVarChar, bikeRightImageUpload.secure_url); // Cloudinary URL
        await request.query(insertQuery);

        res.status(201).json({ success: true,message: 'Dear Rider your request for registration successfully Sent ✅. Please wait for Admin side Confirmation.' });
    } catch (error) {
        console.error('Error registering rider:', error);
        res.status(500).json({ message: 'An error occurred while registering the rider.' });
    }
});
// 


// Rider Exist API (Rider App) ✅
router.post('/rider-exist', async (req, res) => {
    const { email, mobileNumber, altMobileNumber, cnicNumber } = req.body;

        // Check for required fields
        const missingFields = [];
        if (!email) missingFields.push('email');
        if (!mobileNumber) missingFields.push('mobileNumber');
        if (!altMobileNumber) missingFields.push('altMobileNumber');
        if (!cnicNumber) missingFields.push('cnicNumber');
    
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

    await RMDBConnect;
  
    try {
        const request = new sql.Request();
  
        // Step 1: Validate email
        const checkEmailQuery = `SELECT * FROM RidersDetail WHERE RE = @Email;`;
        request.input('Email', sql.NVarChar, email);
        const emailCheckResult = await request.query(checkEmailQuery);
  
        if (emailCheckResult.recordset.length > 0) {
            return res.status(400).json({ message: 'This email is already registered.' });
        }
  
        // Step 2: Validate phone number
        const checkPhoneQuery = `SELECT * FROM RidersDetail WHERE MN = @MobileNumber OR AMN = @MobileNumber;`;
        request.input('MobileNumber', sql.NVarChar, mobileNumber);
        const phoneCheckResult = await request.query(checkPhoneQuery);
  
        if (phoneCheckResult.recordset.length > 0) {
            return res.status(400).json({ message: 'This phone number is already registered.' });
        }
  
        // Step 3: Validate alternative mobile number
        const checkAltPhoneQuery = `SELECT * FROM RidersDetail WHERE MN = @AltMobileNumber OR AMN = @AltMobileNumber;`;
        request.input('AltMobileNumber', sql.NVarChar, altMobileNumber);
        const altPhoneCheckResult = await request.query(checkAltPhoneQuery);
  
        if (altPhoneCheckResult.recordset.length > 0) {
            return res.status(400).json({ message: 'Alternative mobile number is already registered.' });
        }
  
        // Step 4: Validate CNIC number
        const checkCNICQuery = `SELECT * FROM RidersDetail WHERE CNIC = @CnicNumber`;
        request.input('CnicNumber', sql.NVarChar, cnicNumber);
        const CNICCheckResult = await request.query(checkCNICQuery);
  
        if (CNICCheckResult.recordset.length > 0) {
            return res.status(400).json({ message: 'This CNIC number is already registered.' });
        }
  
        res.status(200).json({ success: true, message: 'No Record Found for this Rider' });
    } catch (error) {
        console.error('Error registering rider:', error);
        res.status(500).json({ message: 'An error occurred while registering the rider.' });
    }
  });
  //

// Rider Login(Rider App) ✅
router.post('/rider-login', async (req, res) => {
    const { mobileNumber, password } = req.body;

        // Check for required fields
        const missingFields = [];
        if (!mobileNumber) missingFields.push('mobileNumber');
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
  
      // Check if the rider exists
      const result = await request.query(`SELECT * FROM RidersDetail WHERE MN = '${mobileNumber}'`);
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: "Account not found. Please Register first." });
      }
  
      // Validate password
      const rider = result.recordset[0];
      if(rider.EMSR === "New-Registration"){
        return res.status(401).json({ message: "Your Registration is in Process" });
      }
      if(rider.EMSR !== "Active"){
        return res.status(401).json({ message: "Your Account is Not Active Please Contact with Admin" });
      }
      if (rider.RP !== password) {
        return res.status(401).json({ message: "Invalid Password" });
      }
        // Generate a new JWT token
        const payload = { userId: rider.RUID ,role:'rider'};
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


// Update Rider Status For Check In & Check Out OR On Route ✅
router.put('/status-update-rider', async (req, res) => {
    const { riderId,status } = req.query;

        // Check for required fields
        const missingFields = [];
        if (!riderId) missingFields.push('riderId');
        if (!status) missingFields.push('status');
    
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }
      
    await RMDBConnect;
    try {
    const request = new sql.Request();
    const updateQuery = `UPDATE RidersDetail SET RCS = '${status}' WHERE RUID = '${riderId}'`;
    await request.query(updateQuery);
    res.json({ success: true,message: "Status Updated Successfully" });
    } catch (err) {
          console.error("Error fetching hired riders:", err.message);
          res.status(500).json({ success:false,message: "Oops Server Side Error!"});
    }
});


// Update Rider Status For Check In & Check Out OR On Route ✅
router.put('/fcm-token-update', async (req, res) => {
    const { riderId,fcmToken } = req.query;

        // Check for required fields
        const missingFields = [];
        if (!riderId) missingFields.push('riderId');
        if (!fcmToken) missingFields.push('fcmToken');
    
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }
      
    await RMDBConnect;
    try {
        const request = new sql.Request();
        // Check if rider exists
        const checkRiderQuery = `SELECT * FROM RidersDetail WHERE RUID = @RiderUID`;
        request.input('RiderUID', sql.NVarChar, riderId);
        const riderCheckResult = await request.query(checkRiderQuery);

        if (riderCheckResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Rider not found.' });
        }

    const updateQuery = `UPDATE RidersDetail SET RFCMT = '${fcmToken}' WHERE RUID = '${riderId}'`;
    await request.query(updateQuery);
    res.json({ success: true,message: "FCM Token Updated Successfully" });
    } catch (err) {
          console.error(err.message);
          res.status(500).json({ success:false,message: "Oops Server Side Error!"});
    }
});


// Fetch All Riders API ✅
router.get('/all-riders', async (req, res) => {
    await RMDBConnect;
    try {
      const request = new sql.Request();
      const result = await request.query('SELECT * FROM RidersDetail');
      res.json({success: true,data:result.recordset});
    } catch (err) {
        console.error("Error fetching hired riders:", err.message);
        res.status(500).json({ success:false,message: "Oops Server Side Error!"});
    }
  });
//

// Hire Rider Direct (AT = Hired, EMSR = Hired) ✅
router.put('/hire-rider-direct', async (req, res) => {
    const { riderCNIC, riderId, JDateRider, updateRecordD, actionTakenBy, detailsCheckedBy } = req.body;

    // Check for required fields
    const missingFields = [];
    if (!riderCNIC) missingFields.push('riderCNIC');
    if (!riderId) missingFields.push('riderId');
    if (!JDateRider) missingFields.push('JDateRider');
    if (!updateRecordD) missingFields.push('updateRecordD');
    if (!actionTakenBy) missingFields.push('actionTakenBy');
    if (!detailsCheckedBy) missingFields.push('detailsCheckedBy');

    if (missingFields.length > 0) {
        return res.status(400).json({ 
            success: false, 
            message: `Missing required fields: ${missingFields.join(', ')}` 
        });
    }

    try {
        await RMDBConnect;
        const request = new sql.Request();

        request.input('RiderCNIC', sql.NVarChar, riderCNIC);
        // Check the CNIC
        const checkRiderCNIC = await request.query(
            `SELECT CNIC FROM RidersDetail WHERE CNIC = @RiderCNIC`
        );

        if (checkRiderCNIC.recordset.length === 0) {
            return res.status(400).json({ success: false, message: "There is no rider with this CNIC number." });
        }     

        // Check if the RUID (riderId) is already in use
        request.input('RiderId', sql.Int, riderId);
        const checkExistingUID = await request.query(
            `SELECT RUID FROM RidersDetail WHERE RUID = @RiderId`
        );

        if (checkExistingUID.recordset.length > 0) {
            return res.status(400).json({ success: false, message: "This UID is already assigned." });
        }   

        // Insert the new record into the database
        request.input('JDateRider', sql.Date, JDateRider);
        request.input('UpdateRecordD', sql.Date, updateRecordD);
        request.input('ActionTakenBy', sql.NVarChar, actionTakenBy);
        request.input('DetailsCheckedBy', sql.NVarChar, detailsCheckedBy);

        const result = await request.query(
            `UPDATE RidersDetail 
            SET RUID = @RiderId, JDR = @JDateRider, URD = @UpdateRecordD, ATB = @ActionTakenBy, DCB = @DetailsCheckedBy, AT = 'Hired', EMSR = 'Active' 
            WHERE CNIC = @RiderCNIC`
        );

        res.status(201).json({ success: true, message: "Rider hired Successfully."});
    } catch (err) {
        console.error("Error handling hire-rider-direct API:", err.message);
        res.status(500).json({ success: false, message: "Oops Server Side Error!" });
    }
});
//


// Delete Rider API ✅
router.delete('/rider-delete-admin', async (req, res) => {
    const { riderCNIC } = req.query;
    if (!riderCNIC) {
        return res.status(400).json({ success:false,message: "riderCNIC is Required!" });
      }
    try {
        await RMDBConnect;
        const request = new sql.Request();

        // Check if the rider exists
        const checkRiderQuery = `SELECT * FROM RidersDetail WHERE CNIC = @RiderCNIC;`;
        request.input('RiderCNIC', sql.NVarChar, riderCNIC);
        const riderCheckResult = await request.query(checkRiderQuery);

        if (riderCheckResult.recordset.length === 0) {
            return res.status(404).json({success: false, message: 'Rider not found.' });
        }

        // Delete rider from the database
        const deleteRiderQuery = `DELETE FROM RidersDetail WHERE CNIC = @RiderCNIC;`;
        await request.query(deleteRiderQuery);

        res.status(200).json({ success: true, message: 'Rider deleted successfully.' });
    } catch (error) {
        console.error('Error deleting rider:', error);
        res.status(500).json({ success: false ,message: 'Oops Server Side Error!' });
    }
});
//



  // Fetch all active riders ✅
  router.get('/active-riders', async (req, res) => {
    try {
        await RMDBConnect;
      const request = new sql.Request();
      const query = `
        SELECT 
        RFN AS RFName, 
        CNIC, 
        RUID, 
        RCS AS RCStatus, 
        RLCLALO AS RLocationLALO
        FROM RidersDetail
        WHERE EMSR = 'Active'
      `;
  
      const result = await request.query(query);
  
      // Check if any riders are returned
      if (result.recordset.length === 0) {
        return res.status(404).json({ success: false, message: "No active riders found." });
      }
  
      // Respond with the Active riders
      res.json({ success: true, data: result.recordset });
    } catch (err) {
      console.error("Error fetching hired riders:", err.message);
      res.status(500).json({ success: false, message: "Error fetching active riders" });
    }
  });


// Rider registration API (Rider App) ✅
router.post('/rider-register-admin', upload, async (req, res) => {
    const { riderUID,fullName, email, mobileNumber, altMobileNumber, cnicNumber, currentAddress,
            dob, doi,  password, riderBloodGroup,branchNameAF,registrationSubmitDate, bikeName, 
            bikeNumber,bikeModelY, joiningDForR,licenseNo,licenseIssueDate,licenseExpDate, 
            detailsCheckedBy, actionTakenBy,updateRecordD,riderHaveBike
    } = req.body;

    // Get the uploaded files from the request
    const profileImage = req.files['profileImage'];
    const cnicFrontImage = req.files['cnicFrontImage'];
    const cnicBackImage = req.files['cnicBackImage'];
    const licenseFrontImage = req.files['licenseFrontImage'] ?? 'No-Image';
    const licenseBackImage = req.files['licenseBackImage'] ?? 'No-Image';
    const bikeFrontImage = req.files['bikeFrontImage']?? 'No-Image';
    const bikeBackImage = req.files['bikeBackImage']?? 'No-Image';
    const bikeLeftImage = req.files['bikeLeftImage']?? 'No-Image';
    const bikeRightImage = req.files['bikeRightImage']?? 'No-Image';
        
    try {

        await RMDBConnect;
        const request = new sql.Request();

        // Step 2: Validate UID
        const checkUIDQuery = `SELECT * FROM RidersDetail WHERE RUID = @RiderUID;`;
        request.input('RiderUID', sql.NVarChar, riderUID);
        const UIdCheckResult = await request.query(checkUIDQuery);
        
        if (UIdCheckResult.recordset.length > 0) {
        return res.status(400).json({ message: 'This UID is already Assigned.' });
        }

        // Step 3: Validate email
        const checkEmailQuery = `SELECT * FROM RidersDetail WHERE RE = @Email;`;
        request.input('Email', sql.NVarChar, email);
        const emailCheckResult = await request.query(checkEmailQuery);

        if (emailCheckResult.recordset.length > 0) {
            return res.status(400).json({ message: 'This email is already registered.' });
        }

        // Step 4: Validate phone number
        const checkPhoneQuery = `SELECT * FROM RidersDetail WHERE MN = @MobileNumber OR AMN = @MobileNumber;`;
        request.input('MobileNumber', sql.NVarChar, mobileNumber);
        const phoneCheckResult = await request.query(checkPhoneQuery);

        if (phoneCheckResult.recordset.length > 0) {
            return res.status(400).json({ message: 'This phone number is already registered.' });
        }

        // Step 5: Validate alternative mobile number
        const checkAltPhoneQuery = `SELECT * FROM RidersDetail WHERE MN = @AltMobileNumber OR AMN = @AltMobileNumber;`;
        request.input('AltMobileNumber', sql.NVarChar, altMobileNumber);
        const altPhoneCheckResult = await request.query(checkAltPhoneQuery);

        if (altPhoneCheckResult.recordset.length > 0) {
            return res.status(400).json({ message: 'Alternative mobile number is already registered.' });
        }

        // Step 6: Validate CNIC number
        const checkCNICQuery = `SELECT * FROM RidersDetail WHERE CNIC = @CnicNumber`;
        request.input('CnicNumber', sql.NVarChar, cnicNumber);
        const CNICCheckResult = await request.query(checkCNICQuery);

        if (CNICCheckResult.recordset.length > 0) {
            return res.status(400).json({ message: 'This CNIC number is already registered.' });
        }        
        // Upload images to Cloudinary
        const profileImageUpload = await uploadToCloudinary(profileImage[0].buffer, 'Riders/ProfileImages',`${cnicNumber}-profileImage`);
        const cnicFrontImageUpload = await uploadToCloudinary(cnicFrontImage[0].buffer, 'Riders/CNICImages',`${cnicNumber}-cnicFrontImage`);
        const cnicBackImageUpload = await uploadToCloudinary(cnicBackImage[0].buffer, 'Riders/CNICImages',`${cnicNumber}-cnicBackImage`);
        const licenseFrontImageUpload = await uploadToCloudinary(licenseFrontImage[0].buffer, 'Riders/LicenseImages',`${cnicNumber}-licenseFrontImage`);
        const licenseBackImageUpload = await uploadToCloudinary(licenseBackImage[0].buffer, 'Riders/LicenseImages',`${cnicNumber}-licenseBackImage`);
        const bikeFrontImageUpload = await uploadToCloudinary(bikeFrontImage[0].buffer, 'Riders/BikeImages',`${cnicNumber}-bikeFrontImage`);
        const bikeBackImageUpload = await uploadToCloudinary(bikeBackImage[0].buffer, 'Riders/BikeImages',`${cnicNumber}-bikeBackImage`);
        const bikeLeftImageUpload = await uploadToCloudinary(bikeLeftImage[0].buffer, 'Riders/BikeImages',`${cnicNumber}-bikeLeftImage`);
        const bikeRightImageUpload = await uploadToCloudinary(bikeRightImage[0].buffer, 'Riders/BikeImages',`${cnicNumber}-bikeRightImage`);


        // Step 6: Insert data into the database
        const insertQuery = `
            INSERT INTO RidersDetail (RUID,PIOR, RFN, RE, MN, AMN, CNIC, DOB, DOI, ACNIC, CA, RP, RBG, BNWA,CNICFI, CNICBI, LNUM, LDOI, LDOE, LFI, LBI, BName, BNumber, BMY, JDR,BFI, BBI, BLI, BRI, UT, EMSR, RSD, DCB, AT, ATB, URD,RHBike)
            VALUES (
            @RiderUID,
            @ProfileImage, 
            @FullName, 
            @Email, 
            @MobileNumber, 
            @AltMobileNumber, 
            @CnicNumber,
            @DOB,
            @DOI,  
            @CnicAddress, 
            @CurrentAddress, 
            @Password,
            @RiderBloodGroup, 
            @BranchNameAF,
            @CnicFrontImage, 
            @CnicBackImage, 
            @LicenseNo, 
            @LicenseIssueDate, 
            @LicenseExpDate, 
            @LicenseFrontImage, 
            @LicenseBackImage, 
            @BikeName, 
            @BikeNumber, 
            @BikeModelY, 
            @JoiningDOR,
            @BikeFrontImage, 
            @BikeBackImage, 
            @BikeLeftImage, 
            @BikeRightImage,
            'Rider', 
            'Active',
            @RegistrationSubmitDate,
            @DetailsCheckedBy,
            'Hired',
            @ActionTakenBy,
            @UpdateRecordDate,
            @RiderHaveBike);
        `;

        request.input('ProfileImage', sql.NVarChar, profileImageUpload.secure_url); // Cloudinary URL
        request.input('FullName', sql.NVarChar, fullName);
        request.input('DOB', sql.NVarChar, dob);
        request.input('DOI', sql.NVarChar, doi);
        request.input('CnicAddress', sql.NVarChar, currentAddress);
        request.input('CurrentAddress', sql.NVarChar, currentAddress);
        request.input('Password', sql.NVarChar, password);
        request.input('RiderBloodGroup', sql.NVarChar, riderBloodGroup);
        request.input('BranchNameAF', sql.NVarChar, branchNameAF);
        request.input('RegistrationSubmitDate', sql.NVarChar, registrationSubmitDate);
        request.input('CnicFrontImage', sql.NVarChar, cnicFrontImageUpload.secure_url); // Cloudinary URL
        request.input('CnicBackImage', sql.NVarChar, cnicBackImageUpload.secure_url); // Cloudinary URL
        request.input('LicenseNo', sql.NVarChar, licenseNo);
        request.input('LicenseIssueDate', sql.NVarChar, licenseIssueDate);
        request.input('LicenseExpDate', sql.NVarChar, licenseExpDate);
        request.input('LicenseFrontImage', sql.NVarChar, licenseFrontImageUpload.secure_url); // Cloudinary URL
        request.input('LicenseBackImage', sql.NVarChar, licenseBackImageUpload.secure_url); // Cloudinary URL
        request.input('BikeName', sql.NVarChar, bikeName);
        request.input('BikeNumber', sql.NVarChar, bikeNumber);
        request.input('BikeModelY', sql.NVarChar, bikeModelY);
        request.input('JoiningDOR', sql.NVarChar, joiningDForR);
        request.input('BikeFrontImage', sql.NVarChar, bikeFrontImageUpload.secure_url); // Cloudinary URL
        request.input('BikeBackImage', sql.NVarChar, bikeBackImageUpload.secure_url); // Cloudinary URL
        request.input('BikeLeftImage', sql.NVarChar, bikeLeftImageUpload.secure_url); // Cloudinary URL
        request.input('BikeRightImage', sql.NVarChar, bikeRightImageUpload.secure_url); // Cloudinary URL
        request.input('DetailsCheckedBy', sql.NVarChar, detailsCheckedBy);
        request.input('ActionTakenBy', sql.NVarChar, actionTakenBy);
        request.input('UpdateRecordDate', sql.NVarChar, updateRecordD);
        request.input('RiderHaveBike', sql.NVarChar, riderHaveBike);
        await request.query(insertQuery);

        res.status(201).json({ success: true,message: 'Rider added Successfully' });
    } catch (error) {
        console.error('Error registering rider:', error);
        res.status(500).json({ message: 'An error occurred while registering the rider.' });
    }
});
// 

// Change Rider Status By Admin
router.put('/rider-change-status', async (req, res) => {
    const { rinderCNIC, status,actionTakenBy,actionTaken } = req.query;

        // Check for required fields
        const missingFields = [];
        if (!riderId) missingFields.push('riderId');
        if (!status) missingFields.push('status');
    
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }
      
    await RMDBConnect;
    try {
    const request = new sql.Request();
    const updateQuery = `UPDATE RidersDetail SET RCS = '${status}' WHERE RUID = '${riderId}'`;
    await request.query(updateQuery);
    res.json({ success: true,message: "Status Updated Successfully" });
    } catch (err) {
          console.error("Error fetching hired riders:", err.message);
          res.status(500).json({ success:false,message: "Oops Server Side Error!"});
    }
});

// Update Rider Details API (Admin Side)
router.put('/update-rider-details', upload, async (req, res) => {
    const { riderUID, fullName, email, mobileNumber, altMobileNumber, cnicNumber, currentAddress,
        dob, doi, riderBloodGroup, branchNameAF, bikeName, bikeNumber, bikeModelY, 
        joiningDOR, licenseNo, licenseIssueDate, licenseExpDate, detailsCheckedBy, actionTakenBy
    } = req.body;

    // Get the uploaded files from the request
    const profileImage = req.files['profileImage'];
    const cnicFrontImage = req.files['cnicFrontImage'];
    const cnicBackImage = req.files['cnicBackImage'];
    const licenseFrontImage = req.files['licenseFrontImage'];
    const licenseBackImage = req.files['licenseBackImage'];
    const bikeFrontImage = req.files['bikeFrontImage'];
    const bikeBackImage = req.files['bikeBackImage'];
    const bikeLeftImage = req.files['bikeLeftImage'];
    const bikeRightImage = req.files['bikeRightImage'];

    try {
        await RMDBConnect;
        const request = new sql.Request();

        // Check if rider exists
        const checkRiderQuery = `SELECT * FROM RidersDetail WHERE RUID = @RiderUID`;
        request.input('RiderUID', sql.NVarChar, riderUID);
        const riderCheckResult = await request.query(checkRiderQuery);

        if (riderCheckResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Rider not found.' });
        }

        // Start building the update query
        let updateQuery = `UPDATE RidersDetail SET `;
        const fieldsToUpdate = [];
        const params = [];

        // Add only fields that are present in the request body
        if (fullName) {
            fieldsToUpdate.push('RFN = @FullName');
            params.push({ name: 'FullName', value: fullName });
        }
        if (email) {
            fieldsToUpdate.push('RE = @Email');
            params.push({ name: 'Email', value: email });
        }
        if (mobileNumber) {
            fieldsToUpdate.push('MN = @MobileNumber');
            params.push({ name: 'MobileNumber', value: mobileNumber });
        }
        if (altMobileNumber) {
            fieldsToUpdate.push('AMN = @AltMobileNumber');
            params.push({ name: 'AltMobileNumber', value: altMobileNumber });
        }
        if (cnicNumber) {
            fieldsToUpdate.push('CNIC = @CnicNumber');
            params.push({ name: 'CnicNumber', value: cnicNumber });
        }
        if (currentAddress) {
            fieldsToUpdate.push('CA = @CurrentAddress');
            params.push({ name: 'CurrentAddress', value: currentAddress });
        }
        if (dob) {
            fieldsToUpdate.push('DOB = @DOB');
            params.push({ name: 'DOB', value: dob });
        }
        if (riderBloodGroup) {
            fieldsToUpdate.push('RBG = @RiderBloodGroup');
            params.push({ name: 'RiderBloodGroup', value: riderBloodGroup });
        }
        if (branchNameAF) {
            fieldsToUpdate.push('BNWA = @BranchNameAF');
            params.push({ name: 'BranchNameAF', value: branchNameAF });
        }
        if (bikeName) {
            fieldsToUpdate.push('BName = @BikeName');
            params.push({ name: 'BikeName', value: bikeName });
        }
        if (bikeNumber) {
            fieldsToUpdate.push('BNumber = @BikeNumber');
            params.push({ name: 'BikeNumber', value: bikeNumber });
        }
        if (bikeModelY) {
            fieldsToUpdate.push('BMY = @BikeModelY');
            params.push({ name: 'BikeModelY', value: bikeModelY });
        }
        if (joiningDOR) {
            fieldsToUpdate.push('JDR = @JoiningDOR');
            params.push({ name: 'JoiningDOR', value: joiningDOR });
        }
        if (licenseNo) {
            fieldsToUpdate.push('LNUM = @LicenseNo');
            params.push({ name: 'LicenseNo', value: licenseNo });
        }
        if (licenseIssueDate) {
            fieldsToUpdate.push('LDOI = @LicenseIssueDate');
            params.push({ name: 'LicenseIssueDate', value: licenseIssueDate });
        }
        if (licenseExpDate) {
            fieldsToUpdate.push('LDOE = @LicenseExpDate');
            params.push({ name: 'LicenseExpDate', value: licenseExpDate });
        }
        if (detailsCheckedBy) {
            fieldsToUpdate.push('DCB = @DetailsCheckedBy');
            params.push({ name: 'DetailsCheckedBy', value: detailsCheckedBy });
        }
        if (actionTakenBy) {
            fieldsToUpdate.push('ATB = @ActionTakenBy');
            params.push({ name: 'ActionTakenBy', value: actionTakenBy });
        }

        // Handle uploaded images
        if (profileImage) {
            const profileImageUpload = await uploadToCloudinary(profileImage[0].buffer, 'Riders/ProfileImages', `${cnicNumber}-profileImage`);
            fieldsToUpdate.push('PIOR = @ProfileImage');
            params.push({ name: 'ProfileImage', value: profileImageUpload.secure_url });
        }
        if (cnicFrontImage) {
            const cnicFrontImageUpload = await uploadToCloudinary(cnicFrontImage[0].buffer, 'Riders/CNICImages', `${cnicNumber}-cnicFrontImage`);
            fieldsToUpdate.push('CNICFI = @CnicFrontImage');
            params.push({ name: 'CnicFrontImage', value: cnicFrontImageUpload.secure_url });
        }
        if (cnicBackImage) {
            const cnicBackImageUpload = await uploadToCloudinary(cnicBackImage[0].buffer, 'Riders/CNICImages', `${cnicNumber}-cnicBackImage`);
            fieldsToUpdate.push('CNICBI = @CnicBackImage');
            params.push({ name: 'CnicBackImage', value: cnicBackImageUpload.secure_url });
        }
        if (bikeFrontImage) {
            const bikeFrontImageUpload = await uploadToCloudinary(cnicBackImage[0].buffer, 'Riders/CNICImages', `${cnicNumber}-cnicBackImage`);
            fieldsToUpdate.push('CNICBI = @CnicBackImage');
            params.push({ name: 'CnicBackImage', value: cnicBackImageUpload.secure_url });
        }
        if (bikeBackImage) {
            const cnicBackImageUpload = await uploadToCloudinary(cnicBackImage[0].buffer, 'Riders/CNICImages', `${cnicNumber}-cnicBackImage`);
            fieldsToUpdate.push('CNICBI = @CnicBackImage');
            params.push({ name: 'CnicBackImage', value: cnicBackImageUpload.secure_url });
        }
        if (bikeLeftImage) {
            const cnicBackImageUpload = await uploadToCloudinary(cnicBackImage[0].buffer, 'Riders/CNICImages', `${cnicNumber}-cnicBackImage`);
            fieldsToUpdate.push('CNICBI = @CnicBackImage');
            params.push({ name: 'CnicBackImage', value: cnicBackImageUpload.secure_url });
        }
        if (bikeRightImage) {
            const cnicBackImageUpload = await uploadToCloudinary(cnicBackImage[0].buffer, 'Riders/CNICImages', `${cnicNumber}-cnicBackImage`);
            fieldsToUpdate.push('CNICBI = @CnicBackImage');
            params.push({ name: 'CnicBackImage', value: cnicBackImageUpload.secure_url });
        }
        if (licenseFrontImage) {
            const cnicBackImageUpload = await uploadToCloudinary(cnicBackImage[0].buffer, 'Riders/CNICImages', `${cnicNumber}-cnicBackImage`);
            fieldsToUpdate.push('CNICBI = @CnicBackImage');
            params.push({ name: 'CnicBackImage', value: cnicBackImageUpload.secure_url });
        }
        if (licenseBackImage) {
            const cnicBackImageUpload = await uploadToCloudinary(cnicBackImage[0].buffer, 'Riders/CNICImages', `${cnicNumber}-cnicBackImage`);
            fieldsToUpdate.push('CNICBI = @CnicBackImage');
            params.push({ name: 'CnicBackImage', value: cnicBackImageUpload.secure_url });
        }


        // Finalize the query
        updateQuery += fieldsToUpdate.join(', ') + ' WHERE RUID = @RiderUID';

        // Set all parameters for the query
        params.forEach(param => {
            request.input(param.name, sql.NVarChar, param.value);
        });

        await request.query(updateQuery);
        res.status(200).json({ success: true, message: 'Rider details updated successfully.' });
    } catch (error) {
        console.error('Error updating rider details:', error);
        res.status(500).json({ message: 'An error occurred while updating rider details.' });
    }
});



export default router;