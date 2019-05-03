'use strict';

var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');
var fs = require('fs');
var formidable = require('formidable');


var member_user = null;
var store_path = path.join(__dirname, 'hfc-key-store');
console.log('Store path:'+store_path);
var tx_id = null;


function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
}


function EDI94Request(req, res){

var fabric_client = new Fabric_Client();


var channel = fabric_client.newChannel('asnchannel');
var order = fabric_client.newOrderer('grpc://localhost:7050')
channel.addOrderer(order);


var peer = fabric_client.newPeer('grpc://localhost:8051');
channel.addPeer(peer);
var returnData;
Fabric_Client.newDefaultKeyValueStore({ path: store_path
}).then((state_store) => {

	fabric_client.setStateStore(state_store);
	var crypto_suite = Fabric_Client.newCryptoSuite();
	var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
	crypto_suite.setCryptoKeyStore(crypto_store);
	fabric_client.setCryptoSuite(crypto_suite);

	return fabric_client.getUserContext('MAHUser', true);
}).then((user_from_store) => {
	if (user_from_store && user_from_store.isEnrolled()) {
		console.log('Successfully loaded MAHUser from persistence');
		member_user = user_from_store;
	} else {
		throw new Error('Failed to get MAHUser.... run registerUser.js');
	}


	tx_id = fabric_client.newTransactionID();
	console.log("Assigning transaction_id: ", tx_id._transaction_id);

        var base64file = req.files.File.data.toString('base64');
	var request = {chaincodeId: 'asncc',fcn: 'EDI94Request',args: [base64file],chainId: 'asnchannel',txId: tx_id};

	return channel.sendTransactionProposal(request);
}).then((results) => {
	var proposalResponses = results[0];
        console.log(proposalResponses)
	var proposal = results[1];
        console.log(proposal)
	let isProposalGood = false;
	if (proposalResponses && proposalResponses[0].response &&
		proposalResponses[0].response.status === 200) {
			isProposalGood = true;
			console.log('Transaction proposal was good');
		} else {
			console.error('Transaction proposal was bad');
		}

        returnData = proposalResponses[0].response.payload.toString('utf-8');

        console.log('xxxxxxxxxxxxxxxxxxx: ' + returnData);
	if (isProposalGood) {
		console.log(util.format(
			'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
			proposalResponses[0].response.status, proposalResponses[0].response.message));

		var request = {
			proposalResponses: proposalResponses,
			proposal: proposal
		};

		var transaction_id_string = tx_id.getTransactionID();
		var promises = [];

		var sendPromise = channel.sendTransaction(request);
		promises.push(sendPromise);



		return Promise.all(promises);
	} else {
		console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
		throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
	}
}).then((results) => {
	console.log('Send transaction promise and event listener promise have completed');
	if (results && results[0] && results[0].status === 'SUCCESS') {
		console.log('Successfully sent transaction to the orderer.');
                res.send({code:"200", message: "Shipment EDI94 Requested.", shipmentDetails: returnData});
	} else {
		console.error('Failed to order the transaction. Error code: ' + response.status);
		res.send({code:"500", message: "Shipment EDI94 request failed."});
	}

}).catch((err) => {
	console.error('Failed to invoke successfully :: ' + err);
	res.send({code:"500", message: "Shipment EDI94 request failed."});
});
}



function EDI94Response(req, res){

var fabric_client = new Fabric_Client();

var channel = fabric_client.newChannel('asnchannel');
var order = fabric_client.newOrderer('grpc://localhost:7050')
channel.addOrderer(order);

var peer = fabric_client.newPeer('grpc://localhost:9051');
channel.addPeer(peer);
var returnData;
Fabric_Client.newDefaultKeyValueStore({ path: store_path
}).then((state_store) => {

	fabric_client.setStateStore(state_store);
	var crypto_suite = Fabric_Client.newCryptoSuite();
	var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
	crypto_suite.setCryptoKeyStore(crypto_store);
	fabric_client.setCryptoSuite(crypto_suite);

	return fabric_client.getUserContext('3PLUser', true);
}).then((user_from_store) => {
	if (user_from_store && user_from_store.isEnrolled()) {
		console.log('Successfully loaded 3PLUser from persistence');
		member_user = user_from_store;
	} else {
		throw new Error('Failed to get 3PLUser.... run registerUser.js');
	}

	tx_id = fabric_client.newTransactionID();
	console.log("Assigning transaction_id: ", tx_id._transaction_id);

        console.log(req.body);
        var base64file = req.files.File.data.toString('base64');
	var request = {chaincodeId: 'asncc',fcn: 'EDI94Response',args: [req.body.TrackingId,base64file],chainId: 'asnchannel',txId: tx_id};

	return channel.sendTransactionProposal(request);
}).then((results) => {
	var proposalResponses = results[0];
        console.log(proposalResponses)
	var proposal = results[1];
        console.log(proposal)
	let isProposalGood = false;
	if (proposalResponses && proposalResponses[0].response &&
		proposalResponses[0].response.status === 200) {
			isProposalGood = true;
			console.log('Transaction proposal was good');
		} else {
			console.error('Transaction proposal was bad');
		}

        returnData = proposalResponses[0].response.payload.toString('utf-8');

        console.log('xxxxxxxxxxxxxxxxxxx: ' + returnData);
	if (isProposalGood) {
		console.log(util.format(
			'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
			proposalResponses[0].response.status, proposalResponses[0].response.message));

		var request = {
			proposalResponses: proposalResponses,
			proposal: proposal
		};

		var transaction_id_string = tx_id.getTransactionID();
		var promises = [];

		var sendPromise = channel.sendTransaction(request);
		promises.push(sendPromise);



		return Promise.all(promises);
	} else {
		console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
		throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
	}
}).then((results) => {
	console.log('Send transaction promise and event listener promise have completed');
	if (results && results[0] && results[0].status === 'SUCCESS') {
		console.log('Successfully sent transaction to the orderer.');
                res.send({code:"200", message: "Shipment EDI94 Received.", shipmentDetails: returnData});
	} else {
		console.error('Failed to order the transaction. Error code: ' + response.status);
		res.send({code:"500", message: "Shipment EDI94 response failed."});
	}

}).catch((err) => {
	console.error('Failed to invoke successfully :: ' + err);
	res.send({code:"500", message: "Shipment EDI94 response failed."});
});
}




function EDI85Notification(req, res){

var fabric_client = new Fabric_Client();

var channel = fabric_client.newChannel('asnchannel');
var order = fabric_client.newOrderer('grpc://localhost:7050')
channel.addOrderer(order);


var peer = fabric_client.newPeer('grpc://localhost:8051');
channel.addPeer(peer);
var returnData;
Fabric_Client.newDefaultKeyValueStore({ path: store_path
}).then((state_store) => {

	fabric_client.setStateStore(state_store);
	var crypto_suite = Fabric_Client.newCryptoSuite();
	var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
	crypto_suite.setCryptoKeyStore(crypto_store);
	fabric_client.setCryptoSuite(crypto_suite);

	return fabric_client.getUserContext('MAHUser', true);
}).then((user_from_store) => {
	if (user_from_store && user_from_store.isEnrolled()) {
		console.log('Successfully loaded MAHUser from persistence');
		member_user = user_from_store;
	} else {
		throw new Error('Failed to get MAHUser.... run registerUser.js');
	}


	tx_id = fabric_client.newTransactionID();
	console.log("Assigning transaction_id: ", tx_id._transaction_id);


        console.log(req.files);
        var base64file = req.files.File.data.toString('base64');
        console.log(base64file);
	var request = {chaincodeId: 'asncc',fcn: 'EDI85Notification',args: [req.body.TrackingId, base64file],chainId: 'asnchannel',txId: tx_id};


	return channel.sendTransactionProposal(request);
}).then((results) => {
	var proposalResponses = results[0];
        console.log(proposalResponses)
	var proposal = results[1];
        console.log(proposal)
	let isProposalGood = false;
	if (proposalResponses && proposalResponses[0].response &&
		proposalResponses[0].response.status === 200) {
			isProposalGood = true;
			console.log('Transaction proposal was good');
		} else {
			console.error('Transaction proposal was bad');
		}
        returnData = proposalResponses[0].response.payload.toString('utf-8');

        console.log('xxxxxxxxxxxxxxxxxxx: ' + returnData);
	if (isProposalGood) {
		console.log(util.format(
			'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
			proposalResponses[0].response.status, proposalResponses[0].response.message));


		var request = {
			proposalResponses: proposalResponses,
			proposal: proposal
		};


		var transaction_id_string = tx_id.getTransactionID(); 
		var promises = [];

		var sendPromise = channel.sendTransaction(request);
		promises.push(sendPromise);



		return Promise.all(promises);
	} else {
		console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
		throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
	}
}).then((results) => {
	console.log('Send transaction promise and event listener promise have completed');
	// check the results in the order the promises were added to the promise all list
	if (results && results[0] && results[0].status === 'SUCCESS') {
		console.log('Successfully sent transaction to the orderer.');
                res.send({code:"200", message: "Shipment EDI85 Notified.", shipmentDetails: returnData});
	} else {
		console.error('Failed to order the transaction. Error code: ' + response.status);
		res.send({code:"500", message: "Shipment EDI85 notification failed."});
	}

}).catch((err) => {
	console.error('Failed to invoke successfully :: ' + err);
	res.send({code:"500", message: "Shipment EDI85 notification failed."});
});
}





function SendFile(req, res){


var fabric_client = new Fabric_Client();


var channel = fabric_client.newChannel('asnchannel');
var order = fabric_client.newOrderer('grpc://localhost:7050')
channel.addOrderer(order);

var peer = fabric_client.newPeer('grpc://localhost:8051');
channel.addPeer(peer);
var returnData;
Fabric_Client.newDefaultKeyValueStore({ path: store_path
}).then((state_store) => {

	
	
	fabric_client.setStateStore(state_store);
	var crypto_suite = Fabric_Client.newCryptoSuite();

	var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
	crypto_suite.setCryptoKeyStore(crypto_store);
	fabric_client.setCryptoSuite(crypto_suite);

	return fabric_client.getUserContext('MAHUser', true);
}).then((user_from_store) => {
	if (user_from_store && user_from_store.isEnrolled()) {
		console.log('Successfully loaded MAHUser from persistence');
		member_user = user_from_store;
	} else {
		throw new Error('Failed to get MAHUser.... run registerUser.js');
	}

	tx_id = fabric_client.newTransactionID();
	console.log("Assigning transaction_id: ", tx_id._transaction_id);	
        console.log(req.files);
        var base64file = req.files.File.data.toString('base64');
        console.log(base64file);
	var request = {chaincodeId: 'asncc',fcn: 'SendFile',args: [req.body.TrackingId, base64file],chainId: 'asnchannel',txId: tx_id};

	return channel.sendTransactionProposal(request);
}).then((results) => {
	var proposalResponses = results[0];
        console.log(proposalResponses)
	var proposal = results[1];
        console.log(proposal)
	let isProposalGood = false;
	if (proposalResponses && proposalResponses[0].response &&
		proposalResponses[0].response.status === 200) {
			isProposalGood = true;
			console.log('Transaction proposal was good');
		} else {
			console.error('Transaction proposal was bad');
		}
        returnData = proposalResponses[0].response.payload.toString('utf-8');

        //console.log('xxxxxxxxxxxxxxxxxxx: ' + returnData);
	if (isProposalGood) {
		console.log(util.format(
			'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
			proposalResponses[0].response.status, proposalResponses[0].response.message));

		var request = {
			proposalResponses: proposalResponses,
			proposal: proposal
		};

		var transaction_id_string = tx_id.getTransactionID();
		var promises = [];

		var sendPromise = channel.sendTransaction(request);
		promises.push(sendPromise);



		return Promise.all(promises);
	} else {
		console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
		throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
	}
}).then((results) => {
	console.log('Send transaction promise and event listener promise have completed');
	if (results && results[0] && results[0].status === 'SUCCESS') {
		console.log('Successfully sent transaction to the orderer.');
                res.send({code:"200", message: "Sent File to NON EDI Customer.", shipmentDetails: returnData});
	} else {
		console.error('Failed to order the transaction. Error code: ' + response.status);
		res.send({code:"500", message: "Sending File to Non EDI Customer failed."});
	}

}).catch((err) => {
	console.error('Failed to invoke successfully :: ' + err);
	res.send({code:"500", message: "Sending File to NonEDI Customer failed."});
});
}



function getShipmentStatus(req, res){
	//Init fabric client
	var fabric_client = new Fabric_Client();
	
	// setup the fabric network
	var channel = fabric_client.newChannel('asnchannel');
	var order = fabric_client.newOrderer('grpc://localhost:7050')
	channel.addOrderer(order);
	
	//add buyer peer
	var peer = fabric_client.newPeer('grpc://localhost:7051');
	channel.addPeer(peer);


	Fabric_Client.newDefaultKeyValueStore({ path: store_path
	}).then((state_store) => {
		
		// assign the store to the fabric client
		fabric_client.setStateStore(state_store);
		var crypto_suite = Fabric_Client.newCryptoSuite();
		// use the same location for the state store (where the users' certificate are kept)
		// and the crypto store (where the users' keys are kept)
		var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
		crypto_suite.setCryptoKeyStore(crypto_store);
		fabric_client.setCryptoSuite(crypto_suite);
	
		// get the enrolled user from persistence, this user will sign all requests
		return fabric_client.getUserContext('EDICUSTOMERUser', true);
	}).then((user_from_store) => {
		if (user_from_store && user_from_store.isEnrolled()) {
			console.log('Successfully loaded EDICUSTOMERUser from persistence');
			member_user = user_from_store;
		} else {
			throw new Error('Failed to get EDICUSTOMERUser.... run registerUser.js');
		}
	
		// queryCar chaincode function - requires 1 argument, ex: args: ['CAR4'],
		// queryAllCars chaincode function - requires no arguments , ex: args: [''],
		var request = {chaincodeId: 'asncc',
		fcn: 'getShipmentStatus',
		args: [req.body.TrackingId],
		chainId: 'asnchannel',
		};
	
		// send the query proposal to the peer
		return channel.queryByChaincode(request);
	}).then((query_responses) => {
		console.log("Query has completed, checking results");
		// query_responses could have more than one  results if there multiple peers were used as targets
		if (query_responses && query_responses.length == 1) {
			if (query_responses[0] instanceof Error) {
				console.error("error from query = ", query_responses[0]);
				res.send({code:"500", data: "Issue with getting Claim details"});
			} else {
				
				console.log("Response is ", query_responses[0].toString());
				res.send({code:"200", data: JSON.parse(query_responses[0].toString())});
			}
		} else {
			console.log("No payloads were returned from query");
			res.send({code:"500", data: "No Claim found"});
		}
	}).catch((err) => {
		console.error('Failed to query successfully :: ' + err);
		res.send({code:"500", data: "Issue with getting Claim details"});
	});
	
}


function getShipmentHistory(req, res){

	var fabric_client = new Fabric_Client();
	var channel = fabric_client.newChannel('asnchannel');
	var order = fabric_client.newOrderer('grpc://localhost:7050')
	channel.addOrderer(order);

	var peer = fabric_client.newPeer('grpc://localhost:7051');
	channel.addPeer(peer);

	Fabric_Client.newDefaultKeyValueStore({ path: store_path
	}).then((state_store) => {
		

		fabric_client.setStateStore(state_store);
		var crypto_suite = Fabric_Client.newCryptoSuite();
		var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
		crypto_suite.setCryptoKeyStore(crypto_store);
		fabric_client.setCryptoSuite(crypto_suite);

		return fabric_client.getUserContext('EDICUSTOMERUser', true);
	}).then((user_from_store) => {
		if (user_from_store && user_from_store.isEnrolled()) {
			console.log('Successfully loaded EDICUSTOMERUser from persistence');
			member_user = user_from_store;
		} else {
			throw new Error('Failed to get EDICUSTOMERUser.... run registerUser.js');
		}
	
		var request = {chaincodeId: 'asncc',
		fcn: 'getShipmentHistory',
		args: [req.body.TrackingId],
		chainId: 'asnchannel',
		};

		return channel.queryByChaincode(request);
	}).then((query_responses) => {
		console.log("Query has completed, checking results");
		if (query_responses && query_responses.length == 1) {
			if (query_responses[0] instanceof Error) {
				console.error("error from query = ", query_responses[0]);
				res.send({code:"500", message: "Issue with getting Shipment details"});
			} else {
				
				console.log("Response is ", query_responses[0].toString());
				res.send({code:"200", data: JSON.parse(query_responses[0].toString())});
			}
		} else {
			console.log("No payloads were returned from query");
			res.send({code:"500", message: "No Shipment found"});
		}
	}).catch((err) => {
		console.error('Failed to query successfully :: ' + err);
		res.send({code:"500", message: "Issue with getting Shipment details"});
	});
	
}

let asn = {
	EDI94Request: EDI94Request,
	EDI94Response: EDI94Response,
	EDI85Notification: EDI85Notification,
	SendFile: SendFile,
	getShipmentStatus: getShipmentStatus,
	getShipmentHistory: getShipmentHistory,
}

module.exports = asn;
