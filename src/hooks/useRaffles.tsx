import {useMemo} from "react";
import { useAssetsContext } from "@/hooks/useAssets";

export function useRaffles() {
    const { raffles: rafflesMap, isLoading, updateRaffles } = useAssetsContext();

    const raffles = useMemo(() => {
        return Array.from(rafflesMap.values());
    }, [rafflesMap]);

    return {
        raffles,
        isLoading,
        reload: updateRaffles,
    };
}

export function useRaffle(denom: string) {
    const { raffles, isLoading, raffleWinners } = useAssetsContext();

    const raffle = useMemo(() => {
        if (!denom) return undefined;

        return raffles.get(denom)
    }, [denom, raffles])

    const winners = useMemo(() => {
        if (!denom) return [];
        return raffleWinners.get(denom) || [];
    }, [raffleWinners, denom]);

    return {
        raffle,
        isLoading,
        winners,
    }
}

export function useRaffleContributions() {
    const {
        pendingRaffleContributions,
        addPendingRaffleContribution,
        removePendingRaffleContribution,
        markRaffleContributionAsClosed
    } = useAssetsContext();

    const getPendingContribution = useMemo(() => {
        return (denom: string) => pendingRaffleContributions.get(denom);
    }, [pendingRaffleContributions]);

    return {
        addPendingRaffleContribution,
        getPendingContribution,
        markAsClosed: markRaffleContributionAsClosed,
        removePendingContribution: removePendingRaffleContribution,
    }
}
