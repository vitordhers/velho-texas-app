export class SearchParamsUser {
    pesquisa?: string;
    'precos[]'?: [number?, number?];
    'categorias[]'?: { _id: string, label: string }[];
    'marcas[]'?: { _id: string, label: string }[];
    'tags[]'?: { _id: string, label: string }[];
}
