import {TendermintEvent} from "@/types/events";

export interface BlockResults {
    result: {
        finalize_block_events: TendermintEvent[]
    }
}
