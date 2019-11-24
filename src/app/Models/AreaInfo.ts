import { Rectangle } from "./Rectangle";

export class AreaInfo {
    rectangleId: string;
    pageNumber: number;
    rect: Rectangle = new Rectangle();
    isDelete?: boolean;
    Text?: string;
    distance: number;
    Id?: string;
  } 