import { workspace } from './utils'
import { KeyPair, NEAR } from 'near-workspaces';


workspace.test('add key', async(test, {alice, alice2, bob, master }) =>{
    const keyPair = KeyPair.fromRandom('ed25519')
    alice.setKey(keyPair)
    const arg = {
        account_id: alice,
        public_key: keyPair.getPublicKey().toString(),
        allowance: NEAR.parse('0.25'),
        receiver_id: bob,
    }
    await master.call(master, 'access_key', arg);
    
    const argsMessage = {
        message: 'Ok'
    }
    await alice.call(bob, 'set_status', argsMessage)
    test.is(await bob.view('get_status', {account_id: alice}), 'Ok')
    //testing method fullAccessKey
    const keyPairFull = KeyPair.fromRandom('ed25519')
    alice2.setKey(keyPairFull)
  
    const argFullAccess = {
        account_id: alice2,
        public_key: keyPairFull.getPublicKey().toString(),
    }
  
    await master.call_raw(master, 'full_access_key', argFullAccess);
    test.is(await alice2.call( bob, 'get_status', {account_id: alice2}), null)
        //Alice can't call method  with her key 
    await test.throwsAsync(async () => {await alice.call(bob, 'get_status', {account_id: alice}) });
    // can't use more gas than allowance
    const argError = {
        account_id: alice,
        public_key: keyPair.getPublicKey().toString(),
        allowance: NEAR.parse('0.000000000005'),
        receiver_id: bob,
    }
    await test.throwsAsync(async () => {await master.call(master, 'access_key', argError)}, null, 
        'Access Key {account_id}:{public_key} does not have enough balance 0.000000000005 ' +
        'for transaction costing 0.004231030831429591440366'
        );
    

    await test.throwsAsync(async () => {await alice.call(master.accountId, 'set_status', arg, {attachedDeposit: '1'})})
    // testing key alice
    await test.throwsAsync(
        async () => {await alice.delete(master.accountId, keyPair)},
        null, 
        'The transaction contains more then one action, but it was signed with an access ' +
        'key which allows transaction to apply only one specific action. ' +
        'To apply more then one actions TX must be signed with a full access key');
   
})