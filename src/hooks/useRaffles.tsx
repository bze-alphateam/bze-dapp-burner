import {useState, useEffect, useCallback} from "react";
import { getRaffles, getRaffleWinners } from "@/query/raffle";
import { getBurnerCurrentEpoch } from "@/query/burner";
import { RaffleSDKType, RaffleWinnerSDKType } from "@bze/bzejs/bze/burner/raffle";
import BigNumber from "bignumber.js";

export function useRaffles() {
    const [raffles, setRaffles] = useState<RaffleSDKType[]>([]);
    const [currentEpoch, setCurrentEpoch] = useState<BigNumber>(BigNumber(0));
    const [isLoading, setIsLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const [rafflesData, epochData] = await Promise.all([
                getRaffles(),
                getBurnerCurrentEpoch()
            ]);
            setRaffles(rafflesData || []);
            setCurrentEpoch(epochData);
        } catch (error) {
            console.error('Failed to fetch raffles:', error);
            setRaffles([]);
            setCurrentEpoch(BigNumber(0));
        }
    }, [])

    useEffect(() => {
        const fetchRaffles = async () => {
            setIsLoading(true);
            await load();
            setIsLoading(false);
        };

        fetchRaffles();
    }, [load]);

    return {
        raffles,
        currentEpoch,
        isLoading,
        reload: load,
    };
}

export function useRaffleWinners(denom: string) {
    const [winners, setWinners] = useState<RaffleWinnerSDKType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const load = useCallback(async () => {
        if (!denom) {
            setWinners([]);
            return;
        }

        try {
            const data = await getRaffleWinners(denom);
            setWinners(data || []);
        } catch (error) {
            console.error('Failed to fetch raffle winners:', error);
            setWinners([]);
        }
    }, [denom])

    useEffect(() => {
        const fetchWinners = async () => {
            setIsLoading(true);
            await load();
            setIsLoading(false);
        };

        fetchWinners();
    }, [load]);

    return {
        winners,
        isLoading,
        reload: load,
    };
}
