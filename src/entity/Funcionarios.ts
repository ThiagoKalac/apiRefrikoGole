import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("FUNCIONARIOS", { schema: "PBI" })
export class Funcionarios {
  @PrimaryGeneratedColumn("increment", { type: "bigint", name: "id" })
  id: number;

  @Column("character varying", { name: "cpf", nullable: true, length: 40 })
  cpf: string | null;

  @Column("character varying", {name: "nome", nullable: true, length:40})
  nome: string | null;

  @Column("character varying", {
    name: "cargo_codigo",
    nullable: true,
    length: 24,
  })
  cargoCodigo: string | null;

  @Column("character varying", {
    name: "cargo_nome",
    nullable: true,
    length: 30,
  })
  cargoNome: string | null;

  @Column("character varying", { name: "filial_codigo", nullable: true, length:10 })
  filialCodigo: string | null;

  @Column("character varying", {
    name: "filial_nome",
    nullable: true,
    length: 40,
  })
  filialNome: string | null;

  @Column("character varying", { name: "sexo", nullable: true, length: 1 })
  sexo: string | null;

  @Column("numeric", {
    name: "salario_contratual",
    nullable: true,
    precision: 18,
    scale: 2,
  })
  salarioContratual: string | null;

  @Column("numeric", {
    name: "limite",
    nullable: true,
    precision: 21,
    scale: 4,
  })
  limiete: string | null;
}
