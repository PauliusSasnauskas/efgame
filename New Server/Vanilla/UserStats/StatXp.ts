import IUserStat from "../../Core/IUserStat";

export default class StatXp extends IUserStat {
    static readonly id : string = "va:xp";
    value : number;

    getInitialValue(): number {
        return 0;
    }
    getMaxValue(): undefined {
        return undefined;
    }
}