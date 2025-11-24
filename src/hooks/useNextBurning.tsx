
import {useAssetsContext} from "@/hooks/useAssets";

export function useNextBurning() {
    const {nextBurn, isLoading, updateNextBurn} = useAssetsContext()

    return {
        nextBurn,
        isLoading,
        reload: updateNextBurn,
    };
}
