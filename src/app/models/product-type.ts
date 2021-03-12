import { Item } from './item';

export class ProductType {
    id: string;
    SortNumber: number;
    value: string;
    isSelected: boolean;
    varietals: Item[];
}
