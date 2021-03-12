import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "sortnumber"
})
export class SortPipe {
  transform(array: Array<string>, args: string): Array<string> {
    if(array !== null){
    return array.sort((a: any, b: any) => {
      if (a.SortNumber < b.SortNumber) {
        return -1;
      } else if (a.SortNumber > b.SortNumber) {
        return 1;
      } else {
        return 0;
      }
    });
  }
  }
}