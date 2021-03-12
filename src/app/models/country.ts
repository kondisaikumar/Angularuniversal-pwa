import { Item } from './item';

export class Country {
    id: string;
    SortNumber: number;
    value: string;
    isSelected: boolean;
    regions: Item[];
}
