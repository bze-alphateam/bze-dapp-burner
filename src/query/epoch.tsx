
import {QueryEpochsInfoResponseSDKType} from "@bze/bzejs/bze/epochs/query";
import {getRestClient} from "@/query/client";
import {EpochInfoSDKType} from "@bze/bzejs/bze/epochs/epoch";
import {toBigNumber} from "@/utils/amount";

const EPOCH_HOUR = "hour";
const EPOCH_DAY = "day";
const EPOCH_WEEK = "week";

export async function getEpochsInfo(): Promise<QueryEpochsInfoResponseSDKType> {
    try {
        const client = await getRestClient();

        return client.bze.epochs.epochInfos();
    } catch (e) {
        console.error(e);

        return {epochs: []};
    }
}

export async function getCurrentEpoch(identifier: string): Promise<EpochInfoSDKType|undefined> {
    const all = await getEpochsInfo();

    return all.epochs.find((item: EpochInfoSDKType) => item.identifier === identifier);
}

export async function getHourEpochInfo() {
    return getCurrentEpoch(EPOCH_HOUR);
}

export async function getWeekEpochInfo() {
    return getCurrentEpoch(EPOCH_WEEK);
}

export async function getCurrentWeekEpochEndTime(): Promise<Date|undefined> {
    return getPeriodicEpochEndTime(EPOCH_WEEK);
}

export async function getPeriodicWeekEpochEndTime(modWeek: number = 1): Promise<Date|undefined> {
    return getPeriodicEpochEndTime(EPOCH_WEEK, modWeek);
}

// returns the end time of an epoch. If mod is provided it will return the end time of the epoch maching the mod.
// example: to return the end of a week epoch happening once every 4 weeks use mod = 4
export async function getPeriodicEpochEndTime(identifier: string, mod: number = 1): Promise<Date|undefined> {
    const epoch = await getCurrentEpoch(identifier);
    if (!epoch || !epoch.current_epoch_start_time) {
        return undefined;
    }
    const current = toBigNumber(epoch.current_epoch);
    let remainingEpochs = mod - (current.toNumber() % mod);
    if (remainingEpochs === mod) {
        remainingEpochs = 0;
    }

    const startAt = (new Date(epoch.current_epoch_start_time));
    const duration = getEpochDurationByIdentifier(identifier);
    startAt.setTime(startAt.getTime() + duration + (duration * remainingEpochs));

    return startAt;
}

function getEpochDurationByIdentifier(identifier: string): number {
    const hourMs = 60 * 60 * 1000;
    switch (identifier) {
        case EPOCH_HOUR:
            return hourMs;
        case EPOCH_DAY:
            return hourMs * 24;
        case EPOCH_WEEK:
            return hourMs * 24 * 7;
        default:
            return hourMs;
    }
}
