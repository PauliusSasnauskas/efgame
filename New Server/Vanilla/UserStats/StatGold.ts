import IUserStat from "../../Core/IUserStat";

export default class StatGold extends IUserStat {
    static readonly id : string = "va:gold";
    value : number;

    getInitialValue(): number {
        return 350;
    }
    getMaxValue(): number {
        return 20000;
    }
}