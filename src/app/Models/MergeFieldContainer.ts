
/**
 * Merge Field information container
 */
export class MergeFieldContainer {
    id = "";
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    height: number;
    width: number;
    mergeFieldText: string;
    mergeFieldIdentifier: string;
    value: string;
    isBlankField: boolean;
    entityType: string;
  
    constructor(
      id = "",
      x1: number,
      x2: number,
      y1: number,
      y2: number,
      height: number,
      width: number,
      mergeFieldText: string,
      mergeFieldIdentifier: string,
      value: string = "",
      isBlankField: boolean = false,
      entityType: string) {
      this.id = id;
      this.x1 = x1;
      this.x2 = x2;
      this.y1 = y1;
      this.y2 = y2;
      this.height = height;
      this.width = width;
      this.mergeFieldText = mergeFieldText;
      this.mergeFieldIdentifier = mergeFieldIdentifier;
      this.value = value;
      this.isBlankField = isBlankField;
      this.entityType = entityType
    }
  
  
  }
  
  