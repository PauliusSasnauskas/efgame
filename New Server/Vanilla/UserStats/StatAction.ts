import IUserStat from "../../Core/IUserStat";

export default class StatAction extends IUserStat {
    static readonly id : string = "va:action";
    value : number;
    
    getInitialValue(): number {
        return 8;
    }
    getMaxValue(): number {
        return 12;
    }
}