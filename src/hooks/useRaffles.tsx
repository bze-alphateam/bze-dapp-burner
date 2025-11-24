import { useMemo } from "react";
import { useAssetsContext } from "@/hooks/useAssets";
import { toBigNumber } from "@/utils/amount";
import BigNumber from "bignumber.js";

export function useRaffles() {
    const { raffles: rafflesMap, epochs, isLoading, updateRaffles } = useAssetsContext();

    const raffles = useMemo(() => {
        return Array.from(rafflesMap.values());
    }, [rafflesMap]);

    const currentEpoch = useMemo(() => {
        const hourEpoch = epochs.get('hour');
        if (!hourEpoch) return BigNumber(0);
        return toBigNumber(hourEpoch.current_epoch);
    }, [epochs]);

    return {
        raffles,
        currentEpoch,
        isLoading,
        reload: updateRaffles,
    };
}

export function useRaffleWinners(denom: string) {
    const { raffleWinners, isLoading } = useAssetsContext();

    const winners = useMemo(() => {
        if (!denom) return [];
        return raffleWinners.get(denom) || [];
    }, [raffleWinners, denom]);

    return {
        winners,
        isLoading,
    };
}
