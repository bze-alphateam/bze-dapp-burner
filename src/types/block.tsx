import {TendermintEvent} from "@/types/events";

export interface BlockResults {
    result: {
        end_block_events: TendermintEvent[]
    }
}
