import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items || !searchText) {
        return items;
    }
   // return items.filter(item => item.TemplateName.indexOf(searchText) !== -1);
 searchText = searchText.toLowerCase();
return items.filter( it => { if(it.TemplateName != undefined)
      return it.TemplateName.toLowerCase().includes(searchText);
    });
   }
}