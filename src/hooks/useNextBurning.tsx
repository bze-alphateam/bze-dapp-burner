import {useState, useEffect, useCallback} from "react";
import { getNextBurning } from "@/query/burner";
import { NextBurn } from "@/types/burn";

export function useNextBurning() {
    const [nextBurn, setNextBurn] = useState<NextBurn | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const data = await getNextBurning();
            setNextBurn(data || null);
        } catch (error) {
            console.error('Failed to fetch next burning:', error);
            setNextBurn(null);
        }
    }, [])

    useEffect(() => {
        const fetchNextBurning = async () => {
            setIsLoading(true);
            await load();
            setIsLoading(false);
        };

        fetchNextBurning();
    }, [load]);

    return {
        nextBurn,
        isLoading,
        reload: load,
    };
}
