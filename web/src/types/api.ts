/**
 * Типы данных для API
 */

export interface DoubleLanguageString {
  en: string;
  ru: string;
}

export interface PageDto {
  title: DoubleLanguageString;
  htmlPath: string;
  path?: number[]; // Путь от корня (массив индексов от корня до элемента) для уникальной идентификации элементов с одинаковым htmlPath
  children: PageDto[];
  hasChildren?: boolean; // Флаг наличия дочерних элементов (для оптимизации)
}

export interface BookMeta {
  bookName: string;
  description: string;
  tags: string[];
}

export interface BookInfo {
  filename: string;
  path: string;
  size: number;
  meta: BookMeta | null;
  locale: string;
}

export interface BookPageContent {
  filename: string;
  pageName: string;
  content: string;
}

export interface BookStructure {
  filename: string;
  pages: PageDto[];
}
