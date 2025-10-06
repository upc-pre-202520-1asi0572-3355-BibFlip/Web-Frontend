export class CubicleEntity {
  constructor(id, headquarterId, cubicleNumber, seats, status, zone = 'MAIN_HALL') {
    this.id = id;
    this.headquarterId = headquarterId;
    this.cubicleNumber = cubicleNumber;
    this.seats = seats;
    this.status = status;
    this.zone = zone;
  }

  getZoneDisplayName() {
    const zoneTranslations = {
      'MAIN_HALL': 'A',
      'WINDOW': 'C',
      'TERRACE': 'B'
    };
    return zoneTranslations[this.zone] || this.zone;
  }
}