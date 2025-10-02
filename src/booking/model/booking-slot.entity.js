export class BookingSlot {
    constructor({startTime = '', endTime = ''}) {
        this.startTime = startTime;
        this.endTime = endTime;
    }
}