import { workspace } from './utils'
import { KeyPair, NEAR } from 'near-workspaces';


workspace.test('add key', async(test, {alice, bob, master }) =>{
    const keyPair = KeyPair.fromRandom('ed25519')
    alice.setKey(keyPair)

    const arg = {
        account_id: alice,
        public_key: keyPair.getPublicKey().toString(),
        allowance: NEAR.parse('0.25'),
        receiver_id: bob,
    }

    await master.call (master, 'access_key', arg);
    const argsMessage = {
        message: 'Ok'
    }
    await alice.call(bob, 'set_status', argsMessage)
    test.is(await bob.view('get_status', {account_id: alice}), 'Ok')

})