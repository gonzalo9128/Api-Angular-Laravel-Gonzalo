import {PetitionFile} from "./Petition-File";

export interface Categoria {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  name: string;
  email?: string;
}

export interface Petition {
  id?: number;
  title: string;
  description: string;
  destinatary: string;
  user_id?: number;
  category_id?: number;
  signers?: number;
  status?: string;
  created_at?: Date;
  updated_at?: Date;
  // Array de objetos PetitionFile
  files?: PetitionFile[];
  // Relaciones opcionales
  category?: Categoria;
  user?: User;
  firmantes?: User[]; // Usuarios que han firmado
}
