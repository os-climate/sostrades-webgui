export interface AccessRightItem {
  id: number;
  title: string;
  information: string;

  search(itemSearched: string): boolean;
}
