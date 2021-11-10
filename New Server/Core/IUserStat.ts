export default abstract class IUserStat {
    /* abstract */ static readonly id : string;
    value : number;

    constructor() {
        this.value = this.getInitialValue();
    }

    abstract getInitialValue() : number;
    abstract getMaxValue() : number | undefined;

    add(x : number) : void {
        this.value += x;
        if (this.getMaxValue() === undefined) return;
        if (this.value > this.getMaxValue()!) {
            this.value = this.getMaxValue()!;
        }
    }

    subtract(x : number) : void {
        if (x > this.value) throw new Error("Stat must be checked before subtracting");
        this.value -= x;
    }
}