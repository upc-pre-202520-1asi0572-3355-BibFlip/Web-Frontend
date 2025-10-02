export class HeadquarterEntity {
    constructor({
                    id = '',
                    name = '',
                    landlinePhone = '',
                    mobilePhone = '',
                    latitude = 0,
                    longitude = 0,
                    streetAddress = '',  // Añade esta propiedad
                    street = '',
                    number = '',
                    city = '',
                    postalCode = '',
                    country = '',
                    openingTime = '',
                    closingTime = '',
                    intervalMinutes = 0
                }) {
        this.id = id;
        this.name = name;
        this.landlinePhone = landlinePhone;
        this.mobilePhone = mobilePhone;
        this.latitude = latitude;
        this.longitude = longitude;
        this.streetAddress = streetAddress;  // Añade esta propiedad
        this.street = street;
        this.number = number;
        this.city = city;
        this.postalCode = postalCode;
        this.country = country;
        this.openingTime = openingTime;
        this.closingTime = closingTime;
        this.intervalMinutes = intervalMinutes;
    }
}