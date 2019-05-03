rm -R crypto-config/*

./bin/cryptogen generate --config=crypto-config.yaml

rm config/*

./bin/configtxgen -profile asnOrgOrdererGenesis -outputBlock ./config/genesis.block

./bin/configtxgen -profile asnOrgChannel -outputCreateChannelTx ./config/asnchannel.tx -channelID asnchannel
