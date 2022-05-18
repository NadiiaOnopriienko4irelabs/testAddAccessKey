
const { connect, KeyPair, keyStores, utils} = require("near-api-js");
const path = require("path");
const {  readFile, writeFile } = require("fs").promises;
const homedir = require("os").homedir();
const CREDENTIALS_DIR = ".near-credentials";
const credentialsPath = path.join(homedir, CREDENTIALS_DIR);
const keyStore = new keyStores.UnencryptedFileSystemKeyStore('/Users/nadiiaonopriienko/.near-credentials');


exports.config = {
    keyStore,
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    helperUrl: 'https://near-contract-helper.onrender.com'
};

const generateAccountId = (name) => {
    const randomData = Math.floor(Math.random() * (99999999999999 - 10000000000000) + 10000000000000);
    const accountId = `${name || 'master'}-${Date.now()}-${randomData}`;
    return accountId;
};

// async function deployMaster (file) {
//     const near = await connect(exports.config);
//     const masterAccountId = await createMasterAccount(near);
//     const masterAccount = await near.account(masterAccountId);
//    const account =  await masterAccount.deployContract(await readFile(file));
//     return account
// }

const createMasterAccount = async (near) => {
    const masterAccountId = generateAccountId();
    const accountFilePath = `${credentialsPath}/master-account`;
    const accountFilePathEnv = `${credentialsPath}/master-account.env`;
    const keyPair = await KeyPair.fromRandom('ed25519');

    await near.accountCreator.createAccount(masterAccountId, keyPair.publicKey);
    await keyStore.setKey(exports.config.networkId, masterAccountId, keyPair);
    await writeFile(accountFilePath, masterAccountId);
    await writeFile(accountFilePathEnv, `CONTRACT_NAME=${masterAccountId}`);
    return masterAccountId;
};

async function testAddAccessKey() {
    const near = await connect(exports.config);
    const masterAccountId = await createMasterAccount(near);
    const masterAccount = await near.account(masterAccountId);
    await masterAccount.deployContract(await readFile("../ft_raffle/examples/cookbook/__tests__/res/access_key.wasm"));

    const alice = 'alice.' + masterAccountId
    const bob = 'bob.' + masterAccountId
    const keyPair = await KeyPair.fromRandom('ed25519');

    const arg = {
        account_id: alice,
        public_key: keyPair.publicKey.toString(),
        allowance: utils.format.parseNearAmount('0.25'),
        receiver_id: bob,
    }
    const resultAddKey =  await masterAccount.functionCall ({
        contractId: masterAccount.accountId,
        methodName: 'access_key',
        args: arg,
        attachedDeposit: ''
    });
    console.log('resultAddKey')
    console.log(resultAddKey)

    const argsMessage = {
        message: 'Ok '
    }
    const aliceAccount = await near.account(alice);
    await  keyStore.setKey(exports.config.networkId, aliceAccount.accountId,  keyPair);

   const resultStatus =  await aliceAccount.functionCall({
        contractId: bob,
        methodName: 'set_status',
        args: argsMessage,
        attachedDeposit: ''
    })
    console.log(resultStatus)
    // const res3 = await aliceAccount.deleteAccount(accounts.result.transaction.receiver_id)
    // console.log(res3)


 }

testAddAccessKey();

exports.keyStores = keyStores;
exports.testAddAccessKey = testAddAccessKey
