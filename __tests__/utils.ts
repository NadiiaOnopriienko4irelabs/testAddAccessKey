import { Workspace, NearAccount, BN} from 'near-workspaces-ava';
import {NEAR} from "near-workspaces";

async function initWorkspace(root: NearAccount) {

    const status_message = await root.createAndDeploy('status_message', '__tests__/res/status_message.wasm');
    const linkdrop = await root.createAndDeploy('linkdrop', '__tests__/res/linkdrop.wasm');
    const master = await root.createAndDeploy(
        'master',
        '__tests__/res/access_key.wasm',
        {initialBalance: NEAR.parse('10').toJSON() }
        )
 
    const alice =  root.getAccount('alice.' + master.accountId);
    const alice2 =  root.getAccount('alicce.' + master.accountId);
    const bob =  root.getAccount('bob.' + master.accountId);
    return { alice, alice2,  bob, linkdrop, master };
}

export const workspace = Workspace.init(async ({ root }) => {
    return initWorkspace(root)
});

