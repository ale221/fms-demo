
export class SearchResponse {
  constructor(
    public id: number,
    public entity_type: string,
    public title: string,
  ) {}
}
export class SearchItem {
  constructor(
    public track: string,
    public artist: string,
    public link: string,
    public thumbnail: string,
    public artistId: string
  ) {}
}
