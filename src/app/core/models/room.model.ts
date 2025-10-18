export interface Room {
    id: string;
    name: string;
    number: string;
    description?: string;
    status?: string;
    type: string;
    price: number;
    amenities: string[];
    availability: boolean;
    images: string[];
}
