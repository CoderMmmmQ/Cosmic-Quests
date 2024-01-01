const starknet = require('starknet');
// connect provider
const provider = new starknet.Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });

//new Argent X account v0.2.3
const argentXproxyClassHash = "0x25ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918";
const argentXaccountClassHash = "0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2";

// Generate public and private key pair.
const privateKeyAX = "0x03e9be7873a4e116cbe018af397e8ae336e587f0b6eefccb1370a2aa9e46816b";
console.log('AX_ACCOUNT_PRIVATE_KEY=', privateKeyAX);
const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKey);
console.log('AX_ACCOUNT_PUBLIC_KEY=', starkKeyPubAX);

// Calculate future address of the ArgentX account
const AXproxyConstructorCallData = starknet.CallData.compile({
    implementation: argentXaccountClassHash,
    selector: starknet.hash.getSelectorFromName("initialize"),
    calldata: starknet.CallData.compile({ signer: starkKeyPubAX, guardian: "0" }),
});
const AXcontractAddress = starknet.hash.calculateContractAddressFromHash(
    starkKeyPubAX,
    argentXproxyClassHash,
    AXproxyConstructorCallData,
    0
);
console.log('Precalculated account address=', AXcontractAddress);