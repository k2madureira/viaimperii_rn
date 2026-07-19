import * as legionService from './legion';


export const viaimperiiApi = {
  legion: {
    detail: legionService.getLegion,
    list: legionService.getLegions,
    join: legionService.joinLegion
  }
}