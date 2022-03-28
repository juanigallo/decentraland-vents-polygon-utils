import * as eth from "eth-connect";
import { getUserAccount } from "@decentraland/EthereumController";
import eventTicketData from "src/eventTicket.json";

async function getContract() {
  const metaProvider: any = new eth.WebSocketProvider(
    "wss://speedy-nodes-nyc.moralis.io/99d0bca85b0440c32947f7e9/polygon/mumbai/ws"
  );
  const metaRequestManager: any = new eth.RequestManager(metaProvider);

  let contract: any = await new eth.ContractFactory(
    metaRequestManager,
    eventTicketData.abi
  ).at(eventTicketData.address);

  return {
    contract,
  };
}

export async function checkTokens(eventId: number) {
  const { contract } = await getContract();
  const fromAddress = await getUserAccount();

  const balance = await contract.balanceOf(fromAddress);

  if (Number(balance) == 0) {
    return false;
  } else {
    let res = false;
    for (let i = 0; i < Number(balance); i++) {
      let token = Number(await contract.tokenOfOwnerByIndex(fromAddress, i));

      const tokenURI = await contract.tokenURI(token);
      if (tokenURI) {
        const [currentEventId, currentTicketId] = tokenURI.split("-");
        if (currentEventId == eventId) {
          res = true;
          break;
        }
      }
    }
    return res;
  }
}
