var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

const fileUpload = require('express-fileupload');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(fileUpload());

var ASN = require("./FabricHelper")


// Request LC
router.post('/EDI94Request', function (req, res) {

    ASN.EDI94Request(req, res);

});

// Issue LC
router.post('/EDI94Response', function (req, res) {

    ASN.EDI94Response(req, res);
    
});

// Accept LC
router.post('/EDI85Notification', function (req, res) {

    ASN.EDI85Notification(req, res);
    
});

// Get LC
router.post('/SendFile', function (req, res) {

    ASN.SendFile(req, res);
    
});

// Get LC history
router.post('/getShipmentStatus', function (req, res) {

    ASN.getShipmentStatus(req, res);
    
});

router.post('/getShipmentHistory', function (req, res) {

    ASN.getShipmentHistory(req, res);
    
});


module.exports = router;
