echo "Setting up the network.."

echo "Creating channel genesis block.."


docker exec -e "CORE_PEER_LOCALMSPID=EDICUSTOMERMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/EDICUSTOMER.asn.com/users/Admin@EDICUSTOMER.asn.com/msp" -e "CORE_PEER_ADDRESS=peer0.EDICUSTOMER.asn.com:7051" cli peer channel create -o orderer.asn.com:7050 -c asnchannel -f ./crypto/asnchannel.tx


sleep 5

echo "Channel genesis block created."

echo "peer0.EDICUSTOMER.asn.com joining the channel..."
# Join peer0.EDICUSTOMER.asn.com to the channel.
docker exec -e "CORE_PEER_LOCALMSPID=EDICUSTOMERMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/EDICUSTOMER.asn.com/users/Admin@EDICUSTOMER.asn.com/msp" -e "CORE_PEER_ADDRESS=peer0.EDICUSTOMER.asn.com:7051" cli peer channel join -b asnchannel.block

echo "peer0.EDICUSTOMER.asn.com joined the channel"

echo "peer0.NONEDICUSTOMER.asn.com joining the channel..."
# Join peer0.NONEDICUSTOMER.asn.com to the channel.
docker exec -e "CORE_PEER_LOCALMSPID=NONEDICUSTOMERMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/NONEDICUSTOMER.asn.com/users/Admin@NONEDICUSTOMER.asn.com/msp" -e "CORE_PEER_ADDRESS=peer0.NONEDICUSTOMER.asn.com:7051" cli peer channel join -b asnchannel.block

echo "peer0.NONEDICUSTOMER.asn.com joined the channel"

echo "peer0.MAH.asn.com joining the channel..."

# Join peer0.MAH.asn.com to the channel.
docker exec -e "CORE_PEER_LOCALMSPID=MAHMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/MAH.asn.com/users/Admin@MAH.asn.com/msp" -e "CORE_PEER_ADDRESS=peer0.MAH.asn.com:7051" cli peer channel join -b asnchannel.block

echo "peer0.MAH.asn.com joined the channel"

echo "peer0.3PL.asn.com joining the channel..."
# Join peer0.3PL.asn.com to the channel.
docker exec -e "CORE_PEER_LOCALMSPID=3PLMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/3PL.asn.com/users/Admin@3PL.asn.com/msp" -e "CORE_PEER_ADDRESS=peer0.3PL.asn.com:7051" cli peer channel join -b asnchannel.block
sleep 5

echo "peer0.3PL.asn.com joined the channel"




# install chaincode
# Install code on EDICUSTOMER peer

########
echo "Installing asn chaincode to peer0.EDICUSTOMER.asn.com..."

docker exec -e "CORE_PEER_LOCALMSPID=EDICUSTOMERMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/EDICUSTOMER.asn.com/users/Admin@EDICUSTOMER.asn.com/msp" -e "CORE_PEER_ADDRESS=peer0.EDICUSTOMER.asn.com:7051" cli peer chaincode install -n asncc -v 1.1 -p github.com/asn/go/ -l golang

echo "Installed asn chaincode to peer0.EDICUSTOMER.asn.com"

########
echo "Installing asn chaincode to peer0.NONEDICUSTOMER.asn.com..."

docker exec -e "CORE_PEER_LOCALMSPID=NONEDICUSTOMERMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/NONEDICUSTOMER.asn.com/users/Admin@NONEDICUSTOMER.asn.com/msp" -e "CORE_PEER_ADDRESS=peer0.NONEDICUSTOMER.asn.com:7051" cli peer chaincode install -n asncc -v 1.1 -p github.com/asn/go/ -l golang

echo "Installed asn chaincode to peer0.NONEDICUSTOMER.asn.com"
########

#######

echo "Installing asn chaincode to peer0.MAH.asn.com...."

# Install code on MAH peer
docker exec -e "CORE_PEER_LOCALMSPID=MAHMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/MAH.asn.com/users/Admin@MAH.asn.com/msp" -e "CORE_PEER_ADDRESS=peer0.MAH.asn.com:7051" cli peer chaincode install -n asncc -v 1.1 -p github.com/asn/go/ -l golang

echo "Installed asn chaincode to peer0.MAH.asn.com"

######

echo "Installing asn chaincode to peer0.3PL.asn.com..."
# Install code on 3PL peer
docker exec -e "CORE_PEER_LOCALMSPID=3PLMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/3PL.asn.com/users/Admin@3PL.asn.com/msp" -e "CORE_PEER_ADDRESS=peer0.3PL.asn.com:7051" cli peer chaincode install -n asncc -v 1.1 -p github.com/asn/go/ -l golang

echo "Installed asn chaincode to peer0.3PL.asn.com"

#######

sleep 5

echo "Instantiating asn chaincode.."


docker exec -e "CORE_PEER_LOCALMSPID=MAHMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/MAH.asn.com/users/Admin@MAH.asn.com/msp" -e "CORE_PEER_ADDRESS=peer0.MAH.asn.com:7051" cli peer chaincode instantiate -o orderer.asn.com:7050 -C asnchannel -n asncc -l golang -v 1.1 -c '{"Args":["init"]}'

echo "Instantiated asn chaincode."

echo "Following is the docker network....."

docker ps

cd asn-api

rm hfc-key-store/*

node enroll3PLUser
node enrollEDICUSTOMERUser
node enrollMAHUser
node enrollNONEDICUSTOMERUser

npm install

npm start
