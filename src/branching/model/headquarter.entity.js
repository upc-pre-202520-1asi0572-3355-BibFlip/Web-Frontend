export class HeadquarterEntity {
    constructor(id, name, landlinePhone, mobilePhone, latitude, longitude, street, number, city, postalCode, country,openingTime, closingTime, intervalMinutes) {
        this.id = id;
        this.name = name;
        this.landlinePhone = landlinePhone;
        this.mobilePhone = mobilePhone;
        this.latitude = latitude;
        this.longitude = longitude;
        this.street = street;
        this.number = number;
        this.city = city;
        this.postalCode= postalCode;
        this.country = country;
        this.openingTime = openingTime;
        this.closingTime = closingTime;
        this.intervalMinutes = intervalMinutes;
    }
}