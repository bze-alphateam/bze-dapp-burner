import {RaffleSDKType, RaffleWinnerSDKType} from "@bze/bzejs/bze/burner/raffle";
import {getFromLocalStorage, removeFromLocalStorage, setInLocalStorage} from "@/storage/storage";
import {getRestClient} from "@/query/client";
import {getBlockResults} from "@/query/block";
import {mapEventAttributes} from "@/utils/events";

const RAFFLES_KEY = 'burner:raffles';
const RAFFLE_CACHE_TTL = 60; // 1 minute

export async function getRaffles(): Promise<RaffleSDKType[]> {
    try {
        const cacheKey = RAFFLES_KEY;
        const localData = getFromLocalStorage(cacheKey);
        if (null !== localData) {
            const parsed = JSON.parse(localData);
            if (parsed) {
                return parsed.list;
            }
        }

        const client = await getRestClient();
        const response = await client.bze.burner.raffles();

        setInLocalStorage(cacheKey, JSON.stringify(response), RAFFLE_CACHE_TTL)

        return response.list;
    } catch (e) {
        console.error(e);

        return [];
    }
}

export async function removeRafflesCache() {
    removeFromLocalStorage(RAFFLES_KEY);
}


export async function getRaffleWinners(denom: string): Promise<RaffleWinnerSDKType[]> {
    try {
        const client = await getRestClient();
        const response = await client.bze.burner.raffleWinners({denom: denom});
        return response.list;
    } catch (e) {
        console.error(e);

        return [];
    }
}

interface RaffleResult {
    hasWon: boolean;
    amount: string;
    denom: string;
    address: string;
}

export async function checkAddressWonRaffle(address: string, denom: string, height: number): Promise<RaffleResult> {
    const response = {
        hasWon: false,
        amount: "0",
        denom: denom,
        address: address,
    };
    if (address == "" || height <= 0) {
        return response;
    }

    const blockResults = await getBlockResults(height);
    if (!blockResults) {
        console.error('got invalid block results from rpc');
        return response;
    }

    if (!blockResults.result?.finalize_block_events) {
        return response;
    }

    if (blockResults.result.finalize_block_events.length === 0) {
        return response;
    }


    const raffleEvents = blockResults.result.finalize_block_events.filter(ev => ev.type.includes('Raffle'));
    if (!raffleEvents || raffleEvents.length === 0) {
        return response;
    }

    for (let i = 0; i < raffleEvents.length; i++) {
        const ev = raffleEvents[i];
        const converted = mapEventAttributes(ev.attributes)
        if ('participant' in converted && ev.type.includes('RaffleLostEvent') && converted['participant'] === address) {
            return response;
        }

        if ('winner' in converted && ev.type.includes('RaffleWinnerEvent') && converted['winner'] === address && converted['denom'] === denom) {
            response.hasWon = true;
            response.amount = converted['amount'];
            return response;
        }
    }

    return response;
}
