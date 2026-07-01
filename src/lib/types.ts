export interface FileNode {
  name: string;
  path: string;
  is_dir: boolean;
  children?: FileNode[];
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface PaletteCommand {
  id: string;
  title: string;
  hint?: string;
  icon: string;
  run: () => void;
}

export interface PaletteFile {
  name: string;
  path: string;
}

export type ThemeMode = "light" | "dark";
export type ReadingFont = "sans" | "serif";

export interface Settings {
  theme: ThemeMode;
  font: ReadingFont;
  /** reading font size in rem */
  readSize: number;
  /** comfortable measure in rem */
  measure: number;
  sidebarOpen: boolean;
  tocOpen: boolean;
  focus: boolean;
}
