import { BookingSlot } from './booking-slot.entity.js';

export class Booking {
    constructor({id = '',clientId = '', cubicleNumber = 0, headquarterId = '', cubicleId = '', bookingDate = '', bookingSlots = []
    }) {
        this.id = id;
        this.clientId = clientId;
        this.cubicleNumber = cubicleNumber;
        this.headquarterId = headquarterId;
        this.cubicleId = cubicleId;
        this.bookingDate = bookingDate;
        this.bookingSlots = bookingSlots.map(slot =>
            slot instanceof BookingSlot ? slot : new BookingSlot(slot)
        );
    }
    static fromJson(json) {
        return new Booking(json);
    }
}