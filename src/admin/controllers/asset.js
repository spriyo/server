const Web3 = require("web3");
const { default: axios } = require("axios");
const { Asset } = require("../../models/asset");
const { User } = require("../../models/user");
const { Event } = require("../../models/event");
const nftJSONInterface = require("../../contracts/Spriyo.json");
const web3 = new Web3(
	`https://speedy-nodes-nyc.moralis.io/${process.env.BINANCE_SPEEDY_NODE}/bsc/mainnet`
);

const importAsset = async (req, res) => {
	try {
		const contract_address = req.body.contract_address;
		const contract = new web3.eth.Contract(
			nftJSONInterface.abi,
			contract_address
		);

		let importCount = req.body.import_count;
		if (!importCount)
			return res.status(500).send({ message: "Please enter import count." });

		let totalAdded = 0;
		for (var i = 0; i < importCount; i++) {
			const tokenByIndex = await contract.methods.tokenByIndex(i).call();
			const tokenURI = await contract.methods.tokenURI(tokenByIndex).call();

			const response = await axios.get(tokenURI);
			if (response.status !== 200) {
				res.status(400).send({ message: "unable to fetch metadata." });
			}
			const metadata = response.data;

			const asset = new Asset(req.body);
			const assetExist = await Asset.findOne({
				chainId: asset.chainId,
				contract_address: new RegExp("^" + contract_address + "$", "i"),
				item_id: tokenByIndex,
			});
			if (
				!assetExist &&
				metadata.description &&
				metadata.name &&
				metadata.image
			) {
				asset.imported = true;
				asset.description = metadata.description;
				asset.name = metadata.name;
				asset.image = metadata.image;
				asset.metadata = metadata;
				asset.metadata_url = tokenURI;
				asset.item_id = tokenByIndex;
				asset.owner_address = await contract.methods
					.ownerOf(tokenByIndex)
					.call();

				const userExist = await User.findOne({
					address: asset.owner_address,
				});
				if (userExist) {
					asset.owner = userExist;
				} else {
					const owner = new User({
						displayName: "Unnamed",
						username: asset.owner_address,
						address: asset.owner_address,
					});
					await owner.save();
					asset.owner = owner;
				}

				await asset.save();
				totalAdded++;

				// Event Start
				const event = new Event({
					asset_id: asset._id,
					contract_address: asset.contract_address,
					item_id: asset.item_id,
					user_id: asset.owner,
					event_type: "imported",
					data: asset,
				});
				await event.save();
				// Event End
			}
		}

		res.status(201).send({ totalAdded });
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const deleteContractItem = async (req, res) => {
	try {
		const deleteItem = await Asset.deleteOne(req.body);

		res.send(deleteItem);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const deleteContractItems = async (req, res) => {
	try {
		const deleteItems = await Asset.deleteMany(req.body);

		res.send(deleteItems);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = { importAsset, deleteContractItem, deleteContractItems };
