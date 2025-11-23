import { useCallback, useEffect, useState } from 'react';
import { getAllBurnedCoins } from '@/query/burner';
import { getBlockTimeByHeight } from '@/query/block';
import { useAssets } from '@/hooks/useAssets';
import { useAssetsValue } from '@/hooks/useAssetsValue';
import BigNumber from 'bignumber.js';
import { uAmountToBigNumberAmount } from '@/utils/amount';
import { parseCoins } from '@cosmjs/stargate';
import { BurnHistoryItem } from '@/types/burn';
import {formatDate} from "@/utils/formatter";

export function useBurningHistory(filterDenom?: string) {
    const [burnHistory, setBurnHistory] = useState<BurnHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { denomDecimals } = useAssets();
    const { totalUsdValue } = useAssetsValue();

    const fetchBurnHistory = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getAllBurnedCoins();

            if (!response.burnedCoins || response.burnedCoins.length === 0) {
                setBurnHistory([]);
                setIsLoading(false);
                return;
            }

            const historyPromises = response.burnedCoins.flatMap(async (burnedCoin) => {
                try {
                    // Parse the burned coins string (can contain multiple coins like "1000ubze,2000ibc/hash")
                    const coins = parseCoins(burnedCoin.burned);

                    // Filter out coins with 0 amount immediately
                    const validCoins = coins.filter(coin => coin.amount !== "0");

                    if (validCoins.length === 0) {
                        return [];
                    }

                    // Fetch block time once for all coins in this burn
                    let timestamp = 'unknown';
                    let date: Date | undefined;
                    try {
                        const blockTime = await getBlockTimeByHeight(BigNumber(burnedCoin.height));
                        if (blockTime) {
                            date = blockTime;
                            timestamp = formatDate(new Date(blockTime));
                        }
                    } catch (error) {
                        console.error(`Failed to fetch block time for height ${burnedCoin.height}:`, error);
                    }

                    // Create a history item for each coin in the burn
                    return validCoins.map((coin) => {
                        const { denom, amount } = coin;

                        // Filter by denom if specified
                        if (filterDenom && denom !== filterDenom) {
                            return null;
                        }

                        const decimals = denomDecimals(denom);
                        const prettyAmount = uAmountToBigNumberAmount(amount, decimals);

                        // Calculate USD value
                        const usdValue = totalUsdValue([{ denom, amount: prettyAmount }]);

                        return {
                            denom,
                            amount: prettyAmount,
                            usdValue: usdValue,
                            blockHeight: burnedCoin.height,
                            timestamp,
                            date,
                        };
                    }).filter((item) => item !== null);
                } catch (error) {
                    console.error(`Failed to parse burned coin: ${burnedCoin.burned}`, error);
                    return [];
                }
            });

            const results = await Promise.all(historyPromises);
            const validResults = results.flat();

            // Sort by block height descending (newest first)
            validResults.sort((a, b) => {
                const heightA = BigNumber(a.blockHeight);
                const heightB = BigNumber(b.blockHeight);
                return heightB.comparedTo(heightA) ?? 0;
            });

            setBurnHistory(validResults);
        } catch (error) {
            console.error('Failed to fetch burn history:', error);
            setBurnHistory([]);
        } finally {
            setIsLoading(false);
        }
    }, [denomDecimals, totalUsdValue, filterDenom]);

    useEffect(() => {
        fetchBurnHistory();
    }, [fetchBurnHistory]);

    return {
        burnHistory,
        isLoading,
        refetch: fetchBurnHistory,
    };
}
