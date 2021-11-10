import IUserStat from "../../Core/IUserStat";

export default class StatArmy extends IUserStat {
    static readonly id : string = "va:army";
    value : number;

    getInitialValue(): number {
        return 20;
    }
    getMaxValue(): number {
        return 200;
    }
}