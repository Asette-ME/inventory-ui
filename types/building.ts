export interface Building {
  id: number;
  uuid: string;
  title: string;
  hand_over_date: string | null;
}

export interface BuildingWithImage extends Building {
  imageUrl: string | null;
  hasImage: boolean;
}
