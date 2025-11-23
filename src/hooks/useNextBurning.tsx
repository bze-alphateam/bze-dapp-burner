import { useState, useEffect } from "react";
import { getNextBurning } from "@/query/burner";
import { NextBurn } from "@/types/burn";

export function useNextBurning() {
    const [nextBurn, setNextBurn] = useState<NextBurn | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNextBurning = async () => {
            setIsLoading(true);
            try {
                const data = await getNextBurning();
                setNextBurn(data || null);
            } catch (error) {
                console.error('Failed to fetch next burning:', error);
                setNextBurn(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNextBurning();
    }, []);

    return {
        nextBurn,
        isLoading,
    };
}
