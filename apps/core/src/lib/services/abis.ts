

// aggregatorV3Interface ABI
export const aggregatorV3InterfaceABI = [
	{
		inputs: [],
		name: "decimals",
		outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "description",
		outputs: [{ internalType: "string", name: "", type: "string" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "uint80", name: "_roundId", type: "uint80" }],
		name: "getRoundData",
		outputs: [
			{ internalType: "uint80", name: "roundId", type: "uint80" },
			{ internalType: "int256", name: "answer", type: "int256" },
			{ internalType: "uint256", name: "startedAt", type: "uint256" },
			{ internalType: "uint256", name: "updatedAt", type: "uint256" },
			{ internalType: "uint80", name: "answeredInRound", type: "uint80" },
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "latestRoundData",
		outputs: [
			{ internalType: "uint80", name: "roundId", type: "uint80" },
			{ internalType: "int256", name: "answer", type: "int256" },
			{ internalType: "uint256", name: "startedAt", type: "uint256" },
			{ internalType: "uint256", name: "updatedAt", type: "uint256" },
			{ internalType: "uint80", name: "answeredInRound", type: "uint80" },
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "version",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
];

export const usdfTokenSwayABI = {
	"programType": "contract",
	"specVersion": "1",
	"encodingVersion": "1",
	"concreteTypes": [
	  {
		"type": "()",
		"concreteTypeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
	  },
	  {
		"type": "b256",
		"concreteTypeId": "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
	  },
	  {
		"type": "enum std::identity::Identity",
		"concreteTypeId": "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335",
		"metadataTypeId": 0
	  },
	  {
		"type": "enum std::option::Option<b256>",
		"concreteTypeId": "0c2beb9013490c4f753f2757dfe2d8340b22ce3827d596d81d249b7038033cb6",
		"metadataTypeId": 1,
		"typeArguments": [
		  "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
		]
	  },
	  {
		"type": "enum std::option::Option<struct std::string::String>",
		"concreteTypeId": "7c06d929390a9aeeb8ffccf8173ac0d101a9976d99dda01cce74541a81e75ac0",
		"metadataTypeId": 1,
		"typeArguments": [
		  "9a7f1d3e963c10e0a4ea70a8e20a4813d1dc5682e28f74cb102ae50d32f7f98c"
		]
	  },
	  {
		"type": "enum std::option::Option<u64>",
		"concreteTypeId": "d852149004cc9ec0bbe7dc4e37bffea1d41469b759512b6136f2e865a4c06e7d",
		"metadataTypeId": 1,
		"typeArguments": [
		  "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
		]
	  },
	  {
		"type": "enum std::option::Option<u8>",
		"concreteTypeId": "2da102c46c7263beeed95818cd7bee801716ba8303dddafdcd0f6c9efda4a0f1",
		"metadataTypeId": 1,
		"typeArguments": [
		  "c89951a24c6ca28c13fd1cfdc646b2b656d69e61a92b91023be7eb58eb914b6b"
		]
	  },
	  {
		"type": "str",
		"concreteTypeId": "8c25cb3686462e9a86d2883c5688a22fe738b0bbc85f458d2d2b5f3f667c6d5a"
	  },
	  {
		"type": "struct standards::src20::SetDecimalsEvent",
		"concreteTypeId": "fbe071a6e7ca2b2b5e503e82638f9f11c861a6fb452b65473eca8260db87392d",
		"metadataTypeId": 4
	  },
	  {
		"type": "struct standards::src20::SetNameEvent",
		"concreteTypeId": "6ce295b0fb4c1c15e8ed1cfa4babda47d8a04940a5266a3229e12243a2e37c2c",
		"metadataTypeId": 5
	  },
	  {
		"type": "struct standards::src20::SetSymbolEvent",
		"concreteTypeId": "a8a4b78066c51a50da6349bd395fe1c67e774d75c1db2c5c22288a432d7a363d",
		"metadataTypeId": 6
	  },
	  {
		"type": "struct standards::src20::TotalSupplyEvent",
		"concreteTypeId": "f255d5cc2114d1b6bc34bef4c28d4b60caccffd9a672ed16b79ea217e1c4a8a3",
		"metadataTypeId": 7
	  },
	  {
		"type": "struct std::asset_id::AssetId",
		"concreteTypeId": "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974",
		"metadataTypeId": 9
	  },
	  {
		"type": "struct std::contract_id::ContractId",
		"concreteTypeId": "29c10735d33b5159f0c71ee1dbd17b36a3e69e41f00fab0d42e1bd9f428d8a54",
		"metadataTypeId": 12
	  },
	  {
		"type": "struct std::string::String",
		"concreteTypeId": "9a7f1d3e963c10e0a4ea70a8e20a4813d1dc5682e28f74cb102ae50d32f7f98c",
		"metadataTypeId": 13
	  },
	  {
		"type": "u64",
		"concreteTypeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
	  },
	  {
		"type": "u8",
		"concreteTypeId": "c89951a24c6ca28c13fd1cfdc646b2b656d69e61a92b91023be7eb58eb914b6b"
	  }
	],
	"metadataTypes": [
	  {
		"type": "enum std::identity::Identity",
		"metadataTypeId": 0,
		"components": [
		  {
			"name": "Address",
			"typeId": 8
		  },
		  {
			"name": "ContractId",
			"typeId": 12
		  }
		]
	  },
	  {
		"type": "enum std::option::Option",
		"metadataTypeId": 1,
		"components": [
		  {
			"name": "None",
			"typeId": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
		  },
		  {
			"name": "Some",
			"typeId": 2
		  }
		],
		"typeParameters": [
		  2
		]
	  },
	  {
		"type": "generic T",
		"metadataTypeId": 2
	  },
	  {
		"type": "raw untyped ptr",
		"metadataTypeId": 3
	  },
	  {
		"type": "struct standards::src20::SetDecimalsEvent",
		"metadataTypeId": 4,
		"components": [
		  {
			"name": "asset",
			"typeId": 9
		  },
		  {
			"name": "decimals",
			"typeId": "c89951a24c6ca28c13fd1cfdc646b2b656d69e61a92b91023be7eb58eb914b6b"
		  },
		  {
			"name": "sender",
			"typeId": 0
		  }
		]
	  },
	  {
		"type": "struct standards::src20::SetNameEvent",
		"metadataTypeId": 5,
		"components": [
		  {
			"name": "asset",
			"typeId": 9
		  },
		  {
			"name": "name",
			"typeId": 1,
			"typeArguments": [
			  {
				"name": "",
				"typeId": 13
			  }
			]
		  },
		  {
			"name": "sender",
			"typeId": 0
		  }
		]
	  },
	  {
		"type": "struct standards::src20::SetSymbolEvent",
		"metadataTypeId": 6,
		"components": [
		  {
			"name": "asset",
			"typeId": 9
		  },
		  {
			"name": "symbol",
			"typeId": 1,
			"typeArguments": [
			  {
				"name": "",
				"typeId": 13
			  }
			]
		  },
		  {
			"name": "sender",
			"typeId": 0
		  }
		]
	  },
	  {
		"type": "struct standards::src20::TotalSupplyEvent",
		"metadataTypeId": 7,
		"components": [
		  {
			"name": "asset",
			"typeId": 9
		  },
		  {
			"name": "supply",
			"typeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
		  },
		  {
			"name": "sender",
			"typeId": 0
		  }
		]
	  },
	  {
		"type": "struct std::address::Address",
		"metadataTypeId": 8,
		"components": [
		  {
			"name": "bits",
			"typeId": "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
		  }
		]
	  },
	  {
		"type": "struct std::asset_id::AssetId",
		"metadataTypeId": 9,
		"components": [
		  {
			"name": "bits",
			"typeId": "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
		  }
		]
	  },
	  {
		"type": "struct std::bytes::Bytes",
		"metadataTypeId": 10,
		"components": [
		  {
			"name": "buf",
			"typeId": 11
		  },
		  {
			"name": "len",
			"typeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
		  }
		]
	  },
	  {
		"type": "struct std::bytes::RawBytes",
		"metadataTypeId": 11,
		"components": [
		  {
			"name": "ptr",
			"typeId": 3
		  },
		  {
			"name": "cap",
			"typeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
		  }
		]
	  },
	  {
		"type": "struct std::contract_id::ContractId",
		"metadataTypeId": 12,
		"components": [
		  {
			"name": "bits",
			"typeId": "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
		  }
		]
	  },
	  {
		"type": "struct std::string::String",
		"metadataTypeId": 13,
		"components": [
		  {
			"name": "bytes",
			"typeId": 10
		  }
		]
	  }
	],
	"functions": [
	  {
		"inputs": [
		  {
			"name": "trove_manager",
			"concreteTypeId": "29c10735d33b5159f0c71ee1dbd17b36a3e69e41f00fab0d42e1bd9f428d8a54"
		  }
		],
		"name": "add_trove_manager",
		"output": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
		"attributes": [
		  {
			"name": "storage",
			"arguments": [
			  "read",
			  "write"
			]
		  }
		]
	  },
	  {
		"inputs": [
		  {
			"name": "protocol_manager",
			"concreteTypeId": "29c10735d33b5159f0c71ee1dbd17b36a3e69e41f00fab0d42e1bd9f428d8a54"
		  },
		  {
			"name": "stability_pool",
			"concreteTypeId": "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335"
		  },
		  {
			"name": "borrower_operations",
			"concreteTypeId": "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335"
		  }
		],
		"name": "initialize",
		"output": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
		"attributes": [
		  {
			"name": "storage",
			"arguments": [
			  "read",
			  "write"
			]
		  }
		]
	  },
	  {
		"inputs": [
		  {
			"name": "sub_id",
			"concreteTypeId": "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
		  },
		  {
			"name": "burn_amount",
			"concreteTypeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
		  }
		],
		"name": "burn",
		"output": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
		"attributes": [
		  {
			"name": "storage",
			"arguments": [
			  "read",
			  "write"
			]
		  },
		  {
			"name": "payable",
			"arguments": []
		  }
		]
	  },
	  {
		"inputs": [
		  {
			"name": "address",
			"concreteTypeId": "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335"
		  },
		  {
			"name": "sub_id",
			"concreteTypeId": "0c2beb9013490c4f753f2757dfe2d8340b22ce3827d596d81d249b7038033cb6"
		  },
		  {
			"name": "amount",
			"concreteTypeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
		  }
		],
		"name": "mint",
		"output": "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
		"attributes": [
		  {
			"name": "storage",
			"arguments": [
			  "read",
			  "write"
			]
		  }
		]
	  },
	  {
		"inputs": [
		  {
			"name": "asset",
			"concreteTypeId": "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974"
		  }
		],
		"name": "decimals",
		"output": "2da102c46c7263beeed95818cd7bee801716ba8303dddafdcd0f6c9efda4a0f1",
		"attributes": [
		  {
			"name": "storage",
			"arguments": [
			  "read"
			]
		  }
		]
	  },
	  {
		"inputs": [
		  {
			"name": "asset",
			"concreteTypeId": "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974"
		  }
		],
		"name": "name",
		"output": "7c06d929390a9aeeb8ffccf8173ac0d101a9976d99dda01cce74541a81e75ac0",
		"attributes": [
		  {
			"name": "storage",
			"arguments": [
			  "read"
			]
		  }
		]
	  },
	  {
		"inputs": [
		  {
			"name": "asset",
			"concreteTypeId": "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974"
		  }
		],
		"name": "symbol",
		"output": "7c06d929390a9aeeb8ffccf8173ac0d101a9976d99dda01cce74541a81e75ac0",
		"attributes": [
		  {
			"name": "storage",
			"arguments": [
			  "read"
			]
		  }
		]
	  },
	  {
		"inputs": [],
		"name": "total_assets",
		"output": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
		"attributes": [
		  {
			"name": "storage",
			"arguments": [
			  "read"
			]
		  }
		]
	  },
	  {
		"inputs": [
		  {
			"name": "asset",
			"concreteTypeId": "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974"
		  }
		],
		"name": "total_supply",
		"output": "d852149004cc9ec0bbe7dc4e37bffea1d41469b759512b6136f2e865a4c06e7d",
		"attributes": [
		  {
			"name": "storage",
			"arguments": [
			  "read"
			]
		  }
		]
	  }
	],
	"loggedTypes": [
	  {
		"logId": "10098701174489624218",
		"concreteTypeId": "8c25cb3686462e9a86d2883c5688a22fe738b0bbc85f458d2d2b5f3f667c6d5a"
	  },
	  {
		"logId": "12152039456660331088",
		"concreteTypeId": "a8a4b78066c51a50da6349bd395fe1c67e774d75c1db2c5c22288a432d7a363d"
	  },
	  {
		"logId": "18149631459970394923",
		"concreteTypeId": "fbe071a6e7ca2b2b5e503e82638f9f11c861a6fb452b65473eca8260db87392d"
	  },
	  {
		"logId": "7845998088195677205",
		"concreteTypeId": "6ce295b0fb4c1c15e8ed1cfa4babda47d8a04940a5266a3229e12243a2e37c2c"
	  },
	  {
		"logId": "17462098202904023478",
		"concreteTypeId": "f255d5cc2114d1b6bc34bef4c28d4b60caccffd9a672ed16b79ea217e1c4a8a3"
	  }
	],
	"messagesTypes": [],
	"configurables": [
	  {
		"name": "INITIALIZER",
		"concreteTypeId": "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335",
		"offset": 33608
	  }
	]
  }