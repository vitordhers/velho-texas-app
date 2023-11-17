export class QueryParams {
    pesquisa?: string;
    'categorias[]'?: string[];
    'precos[]'?: [number, number];
    'marcas[]'?: string[];
    'tags[]'?: string[];
}
