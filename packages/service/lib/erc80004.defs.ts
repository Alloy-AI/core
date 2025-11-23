import { createWalletClient, getContract, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { appd } from "./appd";
import {sepolia} from "viem/chains";

const IdentityRegistry = {
    address: {
        11155111: "0x8004a6090Cd10A7288092483047B097295Fb8847"
    },
    abi: [
        {
            "type": "constructor",
            "inputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "agentExists",
            "inputs": [
                {
                    "name": "agentId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "exists",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "approve",
            "inputs": [
                {
                    "name": "to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "tokenId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "balanceOf",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getApproved",
            "inputs": [
                {
                    "name": "tokenId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getMetadata",
            "inputs": [
                {
                    "name": "agentId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "key",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "outputs": [
                {
                    "name": "value",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "isApprovedForAll",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "operator",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "name",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "ownerOf",
            "inputs": [
                {
                    "name": "tokenId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "register",
            "inputs": [],
            "outputs": [
                {
                    "name": "agentId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "register",
            "inputs": [
                {
                    "name": "tokenURI_",
                    "type": "string",
                    "internalType": "string"
                },
                {
                    "name": "metadata",
                    "type": "tuple[]",
                    "internalType": "struct IIdentityRegistry.MetadataEntry[]",
                    "components": [
                        {
                            "name": "key",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "value",
                            "type": "bytes",
                            "internalType": "bytes"
                        }
                    ]
                }
            ],
            "outputs": [
                {
                    "name": "agentId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "register",
            "inputs": [
                {
                    "name": "tokenURI_",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "outputs": [
                {
                    "name": "agentId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "safeTransferFrom",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "tokenId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "safeTransferFrom",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "tokenId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "data",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setApprovalForAll",
            "inputs": [
                {
                    "name": "operator",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "approved",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setMetadata",
            "inputs": [
                {
                    "name": "agentId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "key",
                    "type": "string",
                    "internalType": "string"
                },
                {
                    "name": "value",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "supportsInterface",
            "inputs": [
                {
                    "name": "interfaceId",
                    "type": "bytes4",
                    "internalType": "bytes4"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "symbol",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "tokenURI",
            "inputs": [
                {
                    "name": "tokenId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "totalAgents",
            "inputs": [],
            "outputs": [
                {
                    "name": "count",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "transferFrom",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "tokenId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "event",
            "name": "Approval",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "approved",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "tokenId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "ApprovalForAll",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "operator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "approved",
                    "type": "bool",
                    "indexed": false,
                    "internalType": "bool"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "BatchMetadataUpdate",
            "inputs": [
                {
                    "name": "_fromTokenId",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "_toTokenId",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "MetadataSet",
            "inputs": [
                {
                    "name": "agentId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "indexedKey",
                    "type": "string",
                    "indexed": true,
                    "internalType": "string"
                },
                {
                    "name": "key",
                    "type": "string",
                    "indexed": false,
                    "internalType": "string"
                },
                {
                    "name": "value",
                    "type": "bytes",
                    "indexed": false,
                    "internalType": "bytes"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "MetadataUpdate",
            "inputs": [
                {
                    "name": "_tokenId",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "Registered",
            "inputs": [
                {
                    "name": "agentId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "tokenURI",
                    "type": "string",
                    "indexed": false,
                    "internalType": "string"
                },
                {
                    "name": "owner",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "Transfer",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "tokenId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        }
    ] as const
} as const;
const ReputationRegistry =
    {
        address: {
            11155111: "0x8004B8FD1A363aa02fDC07635C0c5F94f6Af5B7E"
        },
        abi: [
            {
                "type": "constructor",
                "inputs": [
                    {
                        "name": "_identityRegistry",
                        "type": "address",
                        "internalType": "address"
                    }
                ],
                "stateMutability": "nonpayable"
            },
            {
                "type": "function",
                "name": "appendResponse",
                "inputs": [
                    {
                        "name": "agentId",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "clientAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "feedbackIndex",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "responseUri",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "responseHash",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    }
                ],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            {
                "type": "function",
                "name": "getClients",
                "inputs": [
                    {
                        "name": "agentId",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ],
                "outputs": [
                    {
                        "name": "clientList",
                        "type": "address[]",
                        "internalType": "address[]"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "getIdentityRegistry",
                "inputs": [],
                "outputs": [
                    {
                        "name": "registry",
                        "type": "address",
                        "internalType": "address"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "getLastIndex",
                "inputs": [
                    {
                        "name": "agentId",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "clientAddress",
                        "type": "address",
                        "internalType": "address"
                    }
                ],
                "outputs": [
                    {
                        "name": "lastIndex",
                        "type": "uint64",
                        "internalType": "uint64"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "getResponseCount",
                "inputs": [
                    {
                        "name": "agentId",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "clientAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "feedbackIndex",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "responders",
                        "type": "address[]",
                        "internalType": "address[]"
                    }
                ],
                "outputs": [
                    {
                        "name": "count",
                        "type": "uint64",
                        "internalType": "uint64"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "getSummary",
                "inputs": [
                    {
                        "name": "agentId",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "clientAddresses",
                        "type": "address[]",
                        "internalType": "address[]"
                    },
                    {
                        "name": "tag1",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "tag2",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    }
                ],
                "outputs": [
                    {
                        "name": "count",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "averageScore",
                        "type": "uint8",
                        "internalType": "uint8"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "giveFeedback",
                "inputs": [
                    {
                        "name": "agentId",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "score",
                        "type": "uint8",
                        "internalType": "uint8"
                    },
                    {
                        "name": "tag1",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "tag2",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "fileuri",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "filehash",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "feedbackAuth",
                        "type": "bytes",
                        "internalType": "bytes"
                    }
                ],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            {
                "type": "function",
                "name": "identityRegistry",
                "inputs": [],
                "outputs": [
                    {
                        "name": "",
                        "type": "address",
                        "internalType": "contract IdentityRegistry"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "readAllFeedback",
                "inputs": [
                    {
                        "name": "agentId",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "clientAddresses",
                        "type": "address[]",
                        "internalType": "address[]"
                    },
                    {
                        "name": "tag1",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "tag2",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "includeRevoked",
                        "type": "bool",
                        "internalType": "bool"
                    }
                ],
                "outputs": [
                    {
                        "name": "clients",
                        "type": "address[]",
                        "internalType": "address[]"
                    },
                    {
                        "name": "scores",
                        "type": "uint8[]",
                        "internalType": "uint8[]"
                    },
                    {
                        "name": "tag1s",
                        "type": "bytes32[]",
                        "internalType": "bytes32[]"
                    },
                    {
                        "name": "tag2s",
                        "type": "bytes32[]",
                        "internalType": "bytes32[]"
                    },
                    {
                        "name": "revokedStatuses",
                        "type": "bool[]",
                        "internalType": "bool[]"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "readFeedback",
                "inputs": [
                    {
                        "name": "agentId",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "clientAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "index",
                        "type": "uint64",
                        "internalType": "uint64"
                    }
                ],
                "outputs": [
                    {
                        "name": "score",
                        "type": "uint8",
                        "internalType": "uint8"
                    },
                    {
                        "name": "tag1",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "tag2",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "isRevoked",
                        "type": "bool",
                        "internalType": "bool"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "revokeFeedback",
                "inputs": [
                    {
                        "name": "agentId",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "feedbackIndex",
                        "type": "uint64",
                        "internalType": "uint64"
                    }
                ],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            {
                "type": "event",
                "name": "FeedbackRevoked",
                "inputs": [
                    {
                        "name": "agentId",
                        "type": "uint256",
                        "indexed": true,
                        "internalType": "uint256"
                    },
                    {
                        "name": "clientAddress",
                        "type": "address",
                        "indexed": true,
                        "internalType": "address"
                    },
                    {
                        "name": "feedbackIndex",
                        "type": "uint64",
                        "indexed": true,
                        "internalType": "uint64"
                    }
                ],
                "anonymous": false
            },
            {
                "type": "event",
                "name": "NewFeedback",
                "inputs": [
                    {
                        "name": "agentId",
                        "type": "uint256",
                        "indexed": true,
                        "internalType": "uint256"
                    },
                    {
                        "name": "clientAddress",
                        "type": "address",
                        "indexed": true,
                        "internalType": "address"
                    },
                    {
                        "name": "score",
                        "type": "uint8",
                        "indexed": false,
                        "internalType": "uint8"
                    },
                    {
                        "name": "tag1",
                        "type": "bytes32",
                        "indexed": true,
                        "internalType": "bytes32"
                    },
                    {
                        "name": "tag2",
                        "type": "bytes32",
                        "indexed": false,
                        "internalType": "bytes32"
                    },
                    {
                        "name": "fileuri",
                        "type": "string",
                        "indexed": false,
                        "internalType": "string"
                    },
                    {
                        "name": "filehash",
                        "type": "bytes32",
                        "indexed": false,
                        "internalType": "bytes32"
                    }
                ],
                "anonymous": false
            },
            {
                "type": "event",
                "name": "ResponseAppended",
                "inputs": [
                    {
                        "name": "agentId",
                        "type": "uint256",
                        "indexed": true,
                        "internalType": "uint256"
                    },
                    {
                        "name": "clientAddress",
                        "type": "address",
                        "indexed": true,
                        "internalType": "address"
                    },
                    {
                        "name": "feedbackIndex",
                        "type": "uint64",
                        "indexed": false,
                        "internalType": "uint64"
                    },
                    {
                        "name": "responder",
                        "type": "address",
                        "indexed": true,
                        "internalType": "address"
                    },
                    {
                        "name": "responseUri",
                        "type": "string",
                        "indexed": false,
                        "internalType": "string"
                    },
                    {
                        "name": "responseHash",
                        "type": "bytes32",
                        "indexed": false,
                        "internalType": "bytes32"
                    }
                ],
                "anonymous": false
            }
        ] as const
    } as const;

type ChainId = 11155111;

function resolveChain(chainId: ChainId) {
    switch (chainId) {
        case 11155111:
            return sepolia;
        default:
            throw new Error(`Unsupported chainId: ${chainId}`);
    }
}

async function getContracts(chainId: ChainId) {
    const evmClient = createWalletClient({
        account: privateKeyToAccount(await appd.getEvmSecretKey("global")),
        transport: http(resolveChain(chainId).rpcUrls.default.http[0]),
        chain: resolveChain(chainId),
    })

    const identityRegistry = getContract({
        client: evmClient,
        address: IdentityRegistry.address[chainId],
        abi: IdentityRegistry.abi,
    })

    const reputationRegistry = getContract({
        client: evmClient,
        address: ReputationRegistry.address[chainId],
        abi: ReputationRegistry.abi,
    })

    return {
        identityRegistry,
        reputationRegistry,
    };
}
