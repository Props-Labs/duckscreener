import type {
    Provider,
    InvokeFunction,
    BN,
    JsonAbi,
    Account
} from 'fuels';
import { Contract, Interface } from 'fuels';

export const abi = {
    programType: "contract",
    specVersion: "1",
    encodingVersion: "1",
    concreteTypes: [{
        type: "()",
        concreteTypeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
    }, {
        type: "b256",
        concreteTypeId: "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
    }, {
        type: "enum standards::src5::AccessError",
        concreteTypeId: "3f702ea3351c9c1ece2b84048006c8034a24cbc2bad2e740d0412b4172951d3d",
        metadataTypeId: 0
    }, {
        type: "enum standards::src5::State",
        concreteTypeId: "192bc7098e2fe60635a9918afb563e4e5419d386da2bdbf0d716b4bc8549802c",
        metadataTypeId: 1
    }, {
        type: "enum standards::src7::Metadata",
        concreteTypeId: "f44b531974c6c04e17e66ab54e9868d230b9a24b3710b184399c363f0190180d",
        metadataTypeId: 2
    }, {
        type: "enum std::identity::Identity",
        concreteTypeId: "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335",
        metadataTypeId: 3
    }, {
        type: "enum std::option::Option<enum standards::src7::Metadata>",
        concreteTypeId: "fe93748eeb5d91a422fcea06e1b374216ad4ac0b2db01be0a6316af7f90dfa4f",
        metadataTypeId: 4,
        typeArguments: ["f44b531974c6c04e17e66ab54e9868d230b9a24b3710b184399c363f0190180d"]
    }, {
        type: "enum std::option::Option<struct std::string::String>",
        concreteTypeId: "7c06d929390a9aeeb8ffccf8173ac0d101a9976d99dda01cce74541a81e75ac0",
        metadataTypeId: 4,
        typeArguments: ["9a7f1d3e963c10e0a4ea70a8e20a4813d1dc5682e28f74cb102ae50d32f7f98c"]
    }, {
        type: "enum std::option::Option<u64>",
        concreteTypeId: "d852149004cc9ec0bbe7dc4e37bffea1d41469b759512b6136f2e865a4c06e7d",
        metadataTypeId: 4,
        typeArguments: ["1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"]
    }, {
        type: "enum std::option::Option<u8>",
        concreteTypeId: "2da102c46c7263beeed95818cd7bee801716ba8303dddafdcd0f6c9efda4a0f1",
        metadataTypeId: 4,
        typeArguments: ["c89951a24c6ca28c13fd1cfdc646b2b656d69e61a92b91023be7eb58eb914b6b"]
    }, {
        type: "enum sway_libs::asset::errors::MintError",
        concreteTypeId: "dff9dfec998a49b40f1c4b09567400f0e712aaf939c08f7d07bc5c63116e1084",
        metadataTypeId: 5
    }, {
        type: "enum sway_libs::asset::errors::SetMetadataError",
        concreteTypeId: "c6c09c148c1a1341c7ab81697b3545cc695fa67668a169cddc59790a9a0b6b44",
        metadataTypeId: 6
    }, {
        type: "enum sway_libs::ownership::errors::InitializationError",
        concreteTypeId: "1dfe7feadc1d9667a4351761230f948744068a090fe91b1bc6763a90ed5d3893",
        metadataTypeId: 7
    }, {
        type: "struct standards::src20::SetDecimalsEvent",
        concreteTypeId: "fbe071a6e7ca2b2b5e503e82638f9f11c861a6fb452b65473eca8260db87392d",
        metadataTypeId: 10
    }, {
        type: "struct standards::src20::SetNameEvent",
        concreteTypeId: "6ce295b0fb4c1c15e8ed1cfa4babda47d8a04940a5266a3229e12243a2e37c2c",
        metadataTypeId: 11
    }, {
        type: "struct standards::src20::SetSymbolEvent",
        concreteTypeId: "a8a4b78066c51a50da6349bd395fe1c67e774d75c1db2c5c22288a432d7a363d",
        metadataTypeId: 12
    }, {
        type: "struct standards::src20::TotalSupplyEvent",
        concreteTypeId: "f255d5cc2114d1b6bc34bef4c28d4b60caccffd9a672ed16b79ea217e1c4a8a3",
        metadataTypeId: 13
    }, {
        type: "struct standards::src7::SetMetadataEvent",
        concreteTypeId: "f1b1cc90b68559aa4bb5cc58201ebb5c5402ed3aa28927140761e8ff7dcd3ab8",
        metadataTypeId: 14
    }, {
        type: "struct std::asset_id::AssetId",
        concreteTypeId: "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974",
        metadataTypeId: 16
    }, {
        type: "struct std::string::String",
        concreteTypeId: "9a7f1d3e963c10e0a4ea70a8e20a4813d1dc5682e28f74cb102ae50d32f7f98c",
        metadataTypeId: 20
    }, {
        type: "struct sway_libs::ownership::events::OwnershipSet",
        concreteTypeId: "e1ef35033ea9d2956f17c3292dea4a46ce7d61fdf37bbebe03b7b965073f43b5",
        metadataTypeId: 21
    }, {
        type: "u64",
        concreteTypeId: "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
    }, {
        type: "u8",
        concreteTypeId: "c89951a24c6ca28c13fd1cfdc646b2b656d69e61a92b91023be7eb58eb914b6b"
    }],
    metadataTypes: [{
        type: "enum standards::src5::AccessError",
        metadataTypeId: 0,
        components: [{
            name: "NotOwner",
            typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        }]
    }, {
        type: "enum standards::src5::State",
        metadataTypeId: 1,
        components: [{
            name: "Uninitialized",
            typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        }, {
            name: "Initialized",
            typeId: 3
        }, {
            name: "Revoked",
            typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        }]
    }, {
        type: "enum standards::src7::Metadata",
        metadataTypeId: 2,
        components: [{
            name: "B256",
            typeId: "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
        }, {
            name: "Bytes",
            typeId: 17
        }, {
            name: "Int",
            typeId: "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        }, {
            name: "String",
            typeId: 20
        }]
    }, {
        type: "enum std::identity::Identity",
        metadataTypeId: 3,
        components: [{
            name: "Address",
            typeId: 15
        }, {
            name: "ContractId",
            typeId: 19
        }]
    }, {
        type: "enum std::option::Option",
        metadataTypeId: 4,
        components: [{
            name: "None",
            typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        }, {
            name: "Some",
            typeId: 8
        }],
        typeParameters: [8]
    }, {
        type: "enum sway_libs::asset::errors::MintError",
        metadataTypeId: 5,
        components: [{
            name: "ZeroAmount",
            typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        }]
    }, {
        type: "enum sway_libs::asset::errors::SetMetadataError",
        metadataTypeId: 6,
        components: [{
            name: "EmptyString",
            typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        }, {
            name: "EmptyBytes",
            typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        }]
    }, {
        type: "enum sway_libs::ownership::errors::InitializationError",
        metadataTypeId: 7,
        components: [{
            name: "CannotReinitialized",
            typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d"
        }]
    }, {
        type: "generic T",
        metadataTypeId: 8
    }, {
        type: "raw untyped ptr",
        metadataTypeId: 9
    }, {
        type: "struct standards::src20::SetDecimalsEvent",
        metadataTypeId: 10,
        components: [{
            name: "asset",
            typeId: 16
        }, {
            name: "decimals",
            typeId: "c89951a24c6ca28c13fd1cfdc646b2b656d69e61a92b91023be7eb58eb914b6b"
        }, {
            name: "sender",
            typeId: 3
        }]
    }, {
        type: "struct standards::src20::SetNameEvent",
        metadataTypeId: 11,
        components: [{
            name: "asset",
            typeId: 16
        }, {
            name: "name",
            typeId: 4,
            typeArguments: [{
                name: "",
                typeId: 20
            }]
        }, {
            name: "sender",
            typeId: 3
        }]
    }, {
        type: "struct standards::src20::SetSymbolEvent",
        metadataTypeId: 12,
        components: [{
            name: "asset",
            typeId: 16
        }, {
            name: "symbol",
            typeId: 4,
            typeArguments: [{
                name: "",
                typeId: 20
            }]
        }, {
            name: "sender",
            typeId: 3
        }]
    }, {
        type: "struct standards::src20::TotalSupplyEvent",
        metadataTypeId: 13,
        components: [{
            name: "asset",
            typeId: 16
        }, {
            name: "supply",
            typeId: "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        }, {
            name: "sender",
            typeId: 3
        }]
    }, {
        type: "struct standards::src7::SetMetadataEvent",
        metadataTypeId: 14,
        components: [{
            name: "asset",
            typeId: 16
        }, {
            name: "metadata",
            typeId: 4,
            typeArguments: [{
                name: "",
                typeId: 2
            }]
        }, {
            name: "key",
            typeId: 20
        }, {
            name: "sender",
            typeId: 3
        }]
    }, {
        type: "struct std::address::Address",
        metadataTypeId: 15,
        components: [{
            name: "bits",
            typeId: "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
        }]
    }, {
        type: "struct std::asset_id::AssetId",
        metadataTypeId: 16,
        components: [{
            name: "bits",
            typeId: "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
        }]
    }, {
        type: "struct std::bytes::Bytes",
        metadataTypeId: 17,
        components: [{
            name: "buf",
            typeId: 18
        }, {
            name: "len",
            typeId: "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        }]
    }, {
        type: "struct std::bytes::RawBytes",
        metadataTypeId: 18,
        components: [{
            name: "ptr",
            typeId: 9
        }, {
            name: "cap",
            typeId: "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        }]
    }, {
        type: "struct std::contract_id::ContractId",
        metadataTypeId: 19,
        components: [{
            name: "bits",
            typeId: "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
        }]
    }, {
        type: "struct std::string::String",
        metadataTypeId: 20,
        components: [{
            name: "bytes",
            typeId: 17
        }]
    }, {
        type: "struct sway_libs::ownership::events::OwnershipSet",
        metadataTypeId: 21,
        components: [{
            name: "new_owner",
            typeId: 3
        }]
    }],
    functions: [{
        inputs: [{
            name: "asset",
            concreteTypeId: "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974"
        }, {
            name: "key",
            concreteTypeId: "9a7f1d3e963c10e0a4ea70a8e20a4813d1dc5682e28f74cb102ae50d32f7f98c"
        }],
        name: "metadata",
        output: "fe93748eeb5d91a422fcea06e1b374216ad4ac0b2db01be0a6316af7f90dfa4f",
        attributes: [{
            name: "storage",
            arguments: ["read"]
        }]
    }, {
        inputs: [{
            name: "asset",
            concreteTypeId: "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974"
        }],
        name: "decimals",
        output: "2da102c46c7263beeed95818cd7bee801716ba8303dddafdcd0f6c9efda4a0f1",
        attributes: [{
            name: "storage",
            arguments: ["read"]
        }]
    }, {
        inputs: [{
            name: "asset",
            concreteTypeId: "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974"
        }],
        name: "name",
        output: "7c06d929390a9aeeb8ffccf8173ac0d101a9976d99dda01cce74541a81e75ac0",
        attributes: [{
            name: "storage",
            arguments: ["read"]
        }]
    }, {
        inputs: [{
            name: "asset",
            concreteTypeId: "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974"
        }],
        name: "symbol",
        output: "7c06d929390a9aeeb8ffccf8173ac0d101a9976d99dda01cce74541a81e75ac0",
        attributes: [{
            name: "storage",
            arguments: ["read"]
        }]
    }, {
        inputs: [],
        name: "total_assets",
        output: "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        attributes: [{
            name: "storage",
            arguments: ["read"]
        }]
    }, {
        inputs: [{
            name: "asset",
            concreteTypeId: "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974"
        }],
        name: "total_supply",
        output: "d852149004cc9ec0bbe7dc4e37bffea1d41469b759512b6136f2e865a4c06e7d",
        attributes: [{
            name: "storage",
            arguments: ["read"]
        }]
    }, {
        inputs: [],
        name: "owner",
        output: "192bc7098e2fe60635a9918afb563e4e5419d386da2bdbf0d716b4bc8549802c",
        attributes: [{
            name: "storage",
            arguments: ["read"]
        }]
    }, {
        inputs: [],
        name: "amm",
        output: "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335",
        attributes: [{
            name: "storage",
            arguments: ["read"]
        }]
    }, {
        inputs: [{
            name: "sub_id",
            concreteTypeId: "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
        }, {
            name: "amount",
            concreteTypeId: "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        }, {
            name: "name",
            concreteTypeId: "9a7f1d3e963c10e0a4ea70a8e20a4813d1dc5682e28f74cb102ae50d32f7f98c"
        }, {
            name: "symbol",
            concreteTypeId: "9a7f1d3e963c10e0a4ea70a8e20a4813d1dc5682e28f74cb102ae50d32f7f98c"
        }, {
            name: "uri",
            concreteTypeId: "9a7f1d3e963c10e0a4ea70a8e20a4813d1dc5682e28f74cb102ae50d32f7f98c"
        }],
        name: "create_asset_and_mint_for_amm",
        output: "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974",
        attributes: [{
            name: "storage",
            arguments: ["read", "write"]
        }]
    }, {
        inputs: [{
            name: "sub_id",
            concreteTypeId: "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
        }],
        name: "estimate_asset_id",
        output: "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974",
        attributes: [{
            name: "storage",
            arguments: ["read"]
        }]
    }, {
        inputs: [{
            name: "amm",
            concreteTypeId: "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335"
        }],
        name: "initialize",
        output: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        attributes: [{
            name: "storage",
            arguments: ["read", "write"]
        }]
    }],
    loggedTypes: [{
        logId: "4571204900286667806",
        concreteTypeId: "3f702ea3351c9c1ece2b84048006c8034a24cbc2bad2e740d0412b4172951d3d"
    }, {
        logId: "18149631459970394923",
        concreteTypeId: "fbe071a6e7ca2b2b5e503e82638f9f11c861a6fb452b65473eca8260db87392d"
    }, {
        logId: "14321618427101975361",
        concreteTypeId: "c6c09c148c1a1341c7ab81697b3545cc695fa67668a169cddc59790a9a0b6b44"
    }, {
        logId: "7845998088195677205",
        concreteTypeId: "6ce295b0fb4c1c15e8ed1cfa4babda47d8a04940a5266a3229e12243a2e37c2c"
    }, {
        logId: "12152039456660331088",
        concreteTypeId: "a8a4b78066c51a50da6349bd395fe1c67e774d75c1db2c5c22288a432d7a363d"
    }, {
        logId: "17415926155927968170",
        concreteTypeId: "f1b1cc90b68559aa4bb5cc58201ebb5c5402ed3aa28927140761e8ff7dcd3ab8"
    }, {
        logId: "16139176946940135860",
        concreteTypeId: "dff9dfec998a49b40f1c4b09567400f0e712aaf939c08f7d07bc5c63116e1084"
    }, {
        logId: "17462098202904023478",
        concreteTypeId: "f255d5cc2114d1b6bc34bef4c28d4b60caccffd9a672ed16b79ea217e1c4a8a3"
    }, {
        logId: "2161305517876418151",
        concreteTypeId: "1dfe7feadc1d9667a4351761230f948744068a090fe91b1bc6763a90ed5d3893"
    }, {
        logId: "16280289466020123285",
        concreteTypeId: "e1ef35033ea9d2956f17c3292dea4a46ce7d61fdf37bbebe03b7b965073f43b5"
    }],
    messagesTypes: [],
    configurables: []
}



export function getSrc20Contract(address: string, providerOrWallet: Provider | Account) {
    // Create interface first
    const contract = new Contract(address, abi, providerOrWallet);
    return contract
}