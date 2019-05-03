/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * The sample smart contract for documentation topic:
 * Trade Finance Use Case - WORK IN  PROGRESS
 */

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// Define the Smart Contract structure
type SmartContract struct {
}

type Shipment struct {
TrackingId string `json:"TrackingId"`
File string `json:"File"`
Status	string	`json:"Status"`
}


func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger appropriately
	if function == "EDI94Request" {
		return s.EDI94Request(APIstub, args)
	} else if function == "EDI94Response" {
		return s.EDI94Response(APIstub, args)
	} else if function == "EDI85Notification" {
		return s.EDI85Notification(APIstub, args)
	} else if function == "SendFile" {
		return s.SendFile(APIstub, args)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

func (s *SmartContract) EDI94Request(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

    File := args[0];
    TrackingId := time.Now().Format("20060102150405");

    ASN := Shipment{TrackingId:TrackingId, File: File, Status: "EDI94 Requested"};

    ASNBytes,err := json.Marshal(ASN)
    if err != nil {
        return shim.Error("Cannot sent EDI94 request!")
    }
   
    fmt.Println("status got:",ASN.Status)
    APIstub.PutState(TrackingId,ASNBytes)

    fmt.Println("EDI94 Requested -> ", ASN)
    jsonResp := "{\"TrackingId\":\"" + TrackingId + "\"}"
    fmt.Println(jsonResp)

    return shim.Success(ASNBytes);
}


func (s *SmartContract) EDI94Response(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	TrackingId := args[0];
        File := args[1];
	
	// if err != nil {
	// 	return shim.Error("No PolicyCoverage")
	// }

	ASNAsBytes, _ := APIstub.GetState(TrackingId)

	var asn Shipment

	err := json.Unmarshal(ASNAsBytes, &asn)

	if err != nil {
		return shim.Error("Issue with EDI94 response asn json unmarshaling")
	}

	ASN := Shipment{TrackingId: asn.TrackingId, File: File, Status: "EDI94 Received"};
	ASNBytes, err := json.Marshal(ASN)
	if err != nil {
		return shim.Error("Issue with EDI94 response ASN json marshaling")
	}
        APIstub.PutState(asn.TrackingId,ASNBytes)
	fmt.Println("EDI94 Response -> ", ASN)

        return shim.Success(ASNBytes)
}

func (s *SmartContract) EDI85Notification(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	TrackingId := args[0];
        File := args[1];
	

	ASNAsBytes, _ := APIstub.GetState(TrackingId)

	var asn Shipment

	err := json.Unmarshal(ASNAsBytes, &asn)

	if err != nil {
		return shim.Error("Issue with EDI85 Notification ASN json unmarshaling")
	}


        ASN := Shipment{TrackingId: asn.TrackingId, File: File, Status: "EDI85 Notified"};

	ASNBytes, err := json.Marshal(ASN)
	if err != nil {
		return shim.Error("Issue with EDI85 Notification ASN json marshaling")
	}
        APIstub.PutState(asn.TrackingId,ASNBytes)
	fmt.Println("Notifying Shipment -> ", ASN)

        return shim.Success(ASNBytes)
}


func (s *SmartContract) SendFile(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	TrackingId := args[0];
        File := args[1];
	

	ASNAsBytes, _ := APIstub.GetState(TrackingId)

	var asn Shipment

	err := json.Unmarshal(ASNAsBytes, &asn)

	if err != nil {
		return shim.Error("Issue with File Notification ASN json unmarshaling")
	}


        ASN := Shipment{TrackingId: asn.TrackingId, File: File, Status: "Send PDF"};

	ASNBytes, err := json.Marshal(ASN)
	if err != nil {
		return shim.Error("Issue with EDI85 Notification ASN json marshaling")
	}
        APIstub.PutState(asn.TrackingId,ASNBytes)
	fmt.Println("Sending PDF to Non EDI Customer reg. Shipment -> ", ASN)

        return shim.Success(ASNBytes)
}


func (s *SmartContract) getShipmentStatus(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	TrackingId := args[0];
	
	// if err != nil {
	// 	return shim.Error("No PolicyCoverage")
	// }

	ASNAsBytes, _ := APIstub.GetState(TrackingId)
        //fmt.Print(ASNAsBytes)

	return shim.Success(ASNAsBytes)
}


func (s *SmartContract) getShipmentHistory(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	TrackingId := args[0];
	
	

	resultsIterator, err := APIstub.GetHistoryForKey(TrackingId)
	if err != nil {
		return shim.Error("Error retrieving ASN history.")
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing historic values for the marble
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return shim.Error("Error retrieving ASN history.")
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"TxId\":")
		buffer.WriteString("\"")
		buffer.WriteString(response.TxId)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Value\":")
		// if it was a delete operation on given key, then we need to set the
		//corresponding value null. Else, we will write the response.Value
		//as-is (as the Value itself a JSON marble)
		if response.IsDelete {
			buffer.WriteString("null")
		} else {
			buffer.WriteString(string(response.Value))
		}

		buffer.WriteString(", \"Timestamp\":")
		buffer.WriteString("\"")
		buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
		buffer.WriteString("\"")

		buffer.WriteString(", \"IsDelete\":")
		buffer.WriteString("\"")
		buffer.WriteString(strconv.FormatBool(response.IsDelete))
		buffer.WriteString("\"")

		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getASNHistory returning:\n%s\n", buffer.String())

	

	return shim.Success(buffer.Bytes())
}




func getQueryResultForQueryString(stub shim.ChaincodeStubInterface, queryString string) ([]byte, error) {

	fmt.Printf("- getQueryResultForQueryString queryString:\n%s\n", queryString)

	resultsIterator, err := stub.GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryRecords
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getQueryResultForQueryString queryResult:\n%s\n", buffer.String())

	return buffer.Bytes(), nil
}



// The main function is only relevant in unit test mode. Only included here for completeness.
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
