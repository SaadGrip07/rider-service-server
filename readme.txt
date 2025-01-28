##### API's List #####

>>>Riders API's<<<
1. /rider-register -> const {
    fullName, email, mobileNumber, altMobileNumber, cnicNumber, cnicAddress, currentAddress, 
    dob, doi, password, riderBloodGroup, branchNameAF, registrationSubmitDate, riderHaveBike,
    bikeName, bikeNumber, bikeModelY, riderHaveLicense, licenseNo, licenseIssueDate, licenseExpDate,
  } = req.body; (POST)
2. /rider-exist -> const { email, mobileNumber, altMobileNumber, cnicNumber } = req.body; (POST)
3. /rider-login ->  const { mobileNumber, password } = req.body; (POST)
4. /status-update-rider -> const { riderId, status } = req.query; (PUT)
5. /fcm-token-update -> const { riderId, fcmToken } = req.query; (PUT)
6. /all-riders -> Nothing (GET)
7. /hire-rider-direct  -> const {riderCNIC, riderId, JDateRider, updateRecordD, actionTakenBy, detailsCheckedBy,} = req.body; (PUT)
8. /rider-delete-admin -> const { riderCNIC } = req.query; (DELETE)
9. /active-riders ->  Get all Active Riders (GET)