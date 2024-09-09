import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("FUNCIONARIOS", { schema: "PBI" })
export class Funcionarios {
  @PrimaryGeneratedColumn("increment", { type: "bigint", name: "id" })
  id: number;
  
  @Column("character varying", {name:"empresa", nullable: true, length:5})
  empresa: string | null;

  @Column("character varying", {name:"cnpj", nullable: true, length:18})
  cnpj: string | null;

  @Column("character varying", {name:"id_empresa_saib", nullable: true, length:3})
  id_empresa_saib: string | null;

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
  limite: string | null;

  @UpdateDateColumn()
  updated_at: Date;

  @Column("boolean", {name:"salario_alterado",default: false})
  salario_alterado: boolean;

  @Column("numeric", {nullable: true, name:"id_funcionario"})
  id_funcionario: number;

  @Column("numeric", {nullable: true, name:"id_tipo_funcionario"})
  id_tipo_funcionario: number;
}
