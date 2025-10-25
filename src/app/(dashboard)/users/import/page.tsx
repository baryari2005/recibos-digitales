"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/axios";
import { extractDniFromCuil } from "@/lib/cuil";
import * as XLSX from "xlsx";
import { EstadoCivil } from '../../../../constants/estadocivil';
import { FileDown, Loader2, Upload, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconInput } from "@/components/inputs/IconInput";
import { Separator } from "@/components/ui/separator";
import { Nacionalidad } from "@prisma/client";

type Source = "pdf" | "excel";

type ExcelRow = {
  userId: string | null;
  tipoDocumento: string | null;
  documento: string | null;
  cuil: string | null;
  email: string | null;
  nombre: string | null;
  apellido: string | null;
  fechaNacimiento: string | null;
  celular: string | null;
  domicilio: string | null;
  codigoPostal: string | null;
  estadoCivil: string | null;
  nacionalidad: string | null;
  legajo: string | null;
  genero: string | null;
  matriculaProvincial: string | null;
  matriculaNacional: string | null;
  fechaIngreso: string | null;
  fechaEgreso: string | null;
  estadoLaboral: string | null;
  tipoContrato: string | null;
  puesto: string | null;
  area: string | null;
  departamento: string | null;
  categoria: string | null;
  observaciones: string | null;
}

type Row = {
  cuil: string | null;
  apellidoNombre: string | null;
  legajo: string | null;
  fechaIngreso: string | null; // YYYY-MM-DD
  obraSocial: string | null;
};

type Cred = {
  userId: string;
  email: string;
  tempPassword: string; // solo mostramos acá
  status: "created" | "updated";
};

export default function ImportUsersPage() {
  const [source, setSource] = useState<Source>("pdf");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [creds, setCreds] = useState<Cred[]>([]);

  const [excelRows, setExcelRows] = useState<ExcelRow[]>([]);


  // ---------------------------------------------------------------------------
  // 1) Subida y parseo de PDFs (servidor)
  // ---------------------------------------------------------------------------
  async function handleUploadPdf(files: FileList | null) {
    if (!files?.length) return;
    setLoading(true);
    setCreds([]);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const { data } = await axiosInstance.post("/import/recibos", fd);
      setRows(data.rows);
      toast.success(`Leímos ${data.rows.length} registros desde PDF`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? e?.message ?? "No se pudo procesar el PDF");
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // 2) Subida y parseo de Excel/CSV (cliente con xlsx)
  // ---------------------------------------------------------------------------
  async function handleUploadExcel(file: File | null) {
    if (!file) return;
    setLoading(true);
    setCreds([]);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const shName = wb.SheetNames[0];
      const ws = wb.Sheets[shName];

      // A) Si tiene encabezados, transformamos directo:
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: null });

      // B) Intentamos mapear columnas “humanas” a nuestro Row
      const mapped: ExcelRow[] = json.map((r) => {
        // soportá variaciones de headers
        const userId = r.userId ?? r["userId"] ?? null;
        const tipoDocumento = r.tipoDocumento ?? r["tipoDocumento"] ?? null;
        const documento = r.documento ?? r["documento"] ?? null;
        const cuil = r.cuil ?? r["cuil"] ?? null;
        const email = r.email ?? r["email"] ?? null;
        const nombre = r.nombre ?? r["nombre"] ?? null;
        const apellido = r.apellido ?? r["apellido"] ?? null;
        const rawFecha = r.fechaNacimiento ?? r["fechaNacimiento"] ?? null;
        const fechaNacimiento = normalizeExcelDate(rawFecha); // -> YYYY-MM-DD | null
        const rawFechaIngreso = r.fechaIngreso ?? r["fechaIngreso"] ?? null;
        const fechaIngreso = normalizeExcelDate(rawFechaIngreso); // -> YYYY-MM-DD | null
        const rawFechaEgreso = r.fechaEgreso ?? r["fechaEgreso"] ?? null;
        const fechaEgreso     = normalizeExcelDate(rawFechaEgreso);
        const celular = r.celular ?? r["celular"] ?? null;
        const domicilio = r.domicilio ?? r["domicilio"] ?? null;
        const codigoPostal = r.codigoPostal ?? r["codigoPostal"] ?? null;
        const estadoCivil = r.estadoCivil ?? r["estadoCivil"] ?? null;
        const nacionalidad = r.nacionalidad ?? r["nacionalidad"] ?? null;
        const legajo = r.numeroLegajo ?? r["numeroLegajo"] ?? null;
        const genero = r.genero ?? r["genero"] ?? null;
        const matriculaProvincial = r.matriculaProvincial ?? r["matriculaProvincial"] ?? null;
        const matriculaNacional = r.matriculaNacional ?? r["matriculaNacional"] ?? null;
        const estadoLaboral = r.estadoLaboral ?? r["estadoLaboral"] ?? null;
        const tipoContrato = r.tipoContrato ?? r["tipoContrato"] ?? null;
        const puesto = r.puesto ?? r["puesto"] ?? null;
        const area = r.area ?? r["area"] ?? null;
        const departamento = r.departamento ?? r["departamento"] ?? null;
        const categoria = r.categoria ?? r["categoria"] ?? null;
        const observaciones = r.observaciones ?? r["observaciones"] ?? null;


        return {
          userId: nullifyEmpty(StringOrNull(userId)),
          email: nullifyEmpty(StringOrNull(email)),
          nombre: nullifyEmpty(StringOrNull(nombre)),
          apellido: nullifyEmpty(StringOrNull(apellido)),
          fechaNacimiento,
          fechaIngreso,
          fechaEgreso,
          genero: nullifyEmpty(StringOrNull(genero)),
          estadoCivil: nullifyEmpty(StringOrNull(estadoCivil)),
          nacionalidad: nullifyEmpty(StringOrNull(nacionalidad)),
          legajo: nullifyEmpty(StringOrNull(legajo)),
          tipoDocumento: nullifyEmpty(StringOrNull(tipoDocumento)),
          documento: nullifyEmpty(StringOrNull(documento)),
          cuil: nullifyEmpty(StringOrNull(cuil)),
          puesto: nullifyEmpty(StringOrNull(puesto)),
          celular: nullifyEmpty(StringOrNull(celular)),
          domicilio: nullifyEmpty(StringOrNull(domicilio)),
          codigoPostal: nullifyEmpty(StringOrNull(codigoPostal)),
          matriculaProvincial: nullifyEmpty(StringOrNull(matriculaProvincial)),
          matriculaNacional: nullifyEmpty(StringOrNull(matriculaNacional)),
          estadoLaboral: nullifyEmpty(StringOrNull(estadoLaboral)),
          tipoContrato: nullifyEmpty(StringOrNull(tipoContrato)),
          area: nullifyEmpty(StringOrNull(area)),
          departamento: nullifyEmpty(StringOrNull(departamento)),
          categoria: nullifyEmpty(StringOrNull(categoria)),
          observaciones: nullifyEmpty(StringOrNull(observaciones)),
        };
      });

      setExcelRows(mapped);
      toast.success(`Leímos ${mapped.length} registros desde ${file.name}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "No se pudo leer el archivo");
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // 3) Crear/actualizar todos – devuelve tempPassword para mostrar/descargar
  // ---------------------------------------------------------------------------
  async function handleCreateAll() {
    if (!rows.length) return;
    setLoading(true);
    setCreds([]);

    try {
      let okCount = 0,
        failCount = 0;
      const out: Cred[] = [];

      for (const r of rows) {
        try {
          const [ap, ...rest] = (r.apellidoNombre ?? "").trim().split(/\s+/);
          const nombre = rest.join(" ").trim();
          const apellido = ap ?? "";
          const baseId =
            apellido && nombre
              ? `${apellido}.${nombre}`.toLowerCase().replace(/[^a-zñáéíóú0-9]+/g, ".")
              : (r.legajo || r.cuil || `u_${Date.now()}`);

          const payload = {
            user: {
              userId: baseId, // si ya existe NO se cambia
              documentType: "DNI",
              documentNumber: extractDniFromCuil(r.cuil || ""),
              cuil: r.cuil || null,
              email: `${baseId}@example.com`, // placeholder si no tenés email
              nombre,
              apellido,
              rolId: 2,
            },
            legajo: {
              employeeNumber: r.legajo ? Number(r.legajo) : null,
              admissionDate: r.fechaIngreso || null, // "YYYY-MM-DD"
              terminationDate: null,
              employmentStatus: "ACTIVO",
              contractType: null,
              position: null,
              area: null,
              department: null,
              category: null,
              notes: r.obraSocial ? `Obra social: ${r.obraSocial}` : null,
            },
          };

          // 👇 Forzamos setTemp=1 para que si existe el usuario se regenere clave temporal
          const { data } = await axiosInstance.post("/users/import-upsert?setTemp=1", payload);

          if (data?.user?.userId && data?.user?.email && data?.tempPassword) {
            out.push({
              userId: data.user.userId,
              email: data.user.email,
              tempPassword: data.tempPassword,
              status: data?.legajo ? "updated" : "created", // heurística
            });
          }

          okCount++;
        } catch (e: any) {
          console.warn("Fila fallida:", r, e);
          failCount++;
        }
      }

      setCreds(out);
      toast.success(`Listo: ${okCount} ok, ${failCount} con error`);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateExcelAll() {
    if (!excelRows.length) return;
    setLoading(true);
    setCreds([]);

    try {
      let okCount = 0,
        failCount = 0;
      const out: Cred[] = [];

      for (const r of excelRows) {
        try {
          // const [ap, ...rest] = (r.apellidoNombre ?? "").trim().split(/\s+/);
          // const nombre = rest.join(" ").trim();
          // const apellido = ap ?? "";
          // const baseId =
          //   apellido && nombre
          //     ? `${apellido}.${nombre}`.toLowerCase().replace(/[^a-zñáéíóú0-9]+/g, ".")
          //     : (r.legajo || r.cuil || `u_${Date.now()}`);

          const payload = {
            user: {
              userId: r.userId, // si ya existe NO se cambia
              documentType: r.tipoDocumento,
              documentNumber: r.documento,
              cuil: r.cuil || null,
              email: r.email, // placeholder si no tenés email
              nombre: r.nombre,
              apellido: r.apellido,
              fechaNacimiento: r.fechaNacimiento,
              celular: r.celular,
              domicilio: r.domicilio,
              codigoPostal: r.codigoPostal,
              genero: r.genero,
              estadoCivil: r.estadoCivil,            
              nacionalidad: r.nacionalidad,
              rolId: 2,
            },
            legajo: {
              employeeNumber: r.legajo ? Number(r.legajo) : null,
              admissionDate: r.fechaIngreso || null, // "YYYY-MM-DD"
              terminationDate: null,
              employmentStatus: "ACTIVO",
              contractType: "INDETERMINADO",
              position: r.puesto,
              area: null,
              department: null,
              category: null,
              notes: null,
              matriculaProvincial: r.matriculaProvincial,
              matriculaNacional: r.matriculaNacional,
            },
          };

          // 👇 Forzamos setTemp=1 para que si existe el usuario se regenere clave temporal
          const { data } = await axiosInstance.post("/users/import-upsert?setTemp=1", payload);

          if (data?.user?.userId && data?.user?.email && data?.tempPassword) {
            out.push({
              userId: data.user.userId,
              email: data.user.email,
              tempPassword: data.tempPassword,
              status: data?.legajo ? "updated" : "created", // heurística
            });
          }

          okCount++;
        } catch (e: any) {
          console.warn("Fila fallida:", r, e);
          failCount++;
        }
      }

      setCreds(out);
      toast.success(`Listo: ${okCount} ok, ${failCount} con error`);
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // 4) Descarga CSV de credenciales
  // ---------------------------------------------------------------------------
  function downloadCSV() {
    if (!creds.length) return;
    const header = "userId,email,tempPassword\n";
    const body = creds.map((r) => `${r.userId},${r.email},${r.tempPassword}`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "claves-temporales.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------
  const acceptBySource = useMemo(
    () => (source === "pdf" ? "application/pdf" : ".xlsx,.xls,.csv"),
    [source]
  );

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center"><Users className="mr-2" />Importar Usuarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selector de fuente */}
          <div className="flex items-center gap-3">
            <Label className="text-sm">Fuente:</Label>

            <div className="inline-flex h-11 rounded-md overflow-hidden border ">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setRows([]);
                  setCreds([]);
                  setSource("pdf");
                }}
                aria-pressed={source === "pdf"}
                className={cn(
                  "h-full rounded-none px-4 font-medium focus-visible:ring-2 focus-visible:ring-[#008C93]",
                  source === "pdf"
                    // activo: texto SIEMPRE blanco (también en hover)
                    ? "bg-[#008C93] text-white hover:bg-[#008C93] hover:text-white"
                    // inactivo
                    : "text-[#008C93] hover:bg-[#008C93]/10 hover:text-[#008C93]"
                )}
              >
                PDF
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setRows([]);
                  setCreds([]);
                  setSource("excel");
                }}
                aria-pressed={source === "excel"}
                className={cn(
                  // separador interno SIEMPRE negro
                  "h-full rounded-none px-4 font-medium -ml-px border-l border-black focus-visible:ring-2 focus-visible:ring-[#008C93]",
                  source === "excel"
                    // activo: texto SIEMPRE blanco (también en hover)
                    ? "bg-[#008C93] text-white hover:bg-[#008C93] hover:text-white"
                    // inactivo
                    : "text-[#008C93] hover:bg-[#008C93]/10 hover:text-[#008C93]"
                )}
              >
                Excel / CSV
              </Button>
            </div>
          </div>

          {/* Uploader */}
          <div className="space-y-2">
            <Label>
              {source === "pdf" ? "Seleccioná uno o varios PDFs" : "Seleccioná un Excel/CSV"}
            </Label>
            {source === "pdf" ? (
              <IconInput
                id="file"
                leftIcon={<Upload className="h-4 w-4 text-muted-foreground" />}
                input={
                  <Input
                    type="file"
                    accept={acceptBySource}
                    multiple
                    className="h-11 rounded border  pl-9 pr-3"
                    onChange={(e) => handleUploadPdf(e.target.files)}
                  />
                }
              />
            ) : (

              <IconInput
                id="file"
                leftIcon={<Upload className="h-4 w-4 text-muted-foreground" />}
                input={
                  <Input
                    type="file"
                    accept={acceptBySource}
                    multiple
                    className="h-11 rounded border  pl-9 pr-3"
                    onChange={(e) => handleUploadExcel(e.target.files?.[0] || null)}
                  />
                }
              />
            )}

            {source === "excel" && (
              <p className="text-xs text-muted-foreground">
                Encabezados sugeridos: <code>userId</code>, <code>apellido</code>,{" "}
                <code>nombre</code>, <code>Legajo</code>, <code>Fecha ingreso</code>, <code>etc</code>.
              </p>
            )}
          </div>

          {/* Preview */}
          {source === "pdf" ? (
            (
              rows.length > 0 && (
                <>
                  <div className="rounded border mb-8">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="p-2 text-left">CUIL</th>
                          <th className="p-2 text-left">Apellido y nombre</th>
                          <th className="p-2 text-left">Legajo</th>
                          <th className="p-2 text-left">Fecha ingreso</th>
                          <th className="p-2 text-left">Obra social</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, i) => (
                          <tr key={i} className="border-t">
                            <td className="p-2">{r.cuil ?? "-"}</td>
                            <td className="p-2">{r.apellidoNombre ?? "-"}</td>
                            <td className="p-2">{r.legajo ?? "-"}</td>
                            <td className="p-2">{r.fechaIngreso ?? "-"}</td>
                            <td className="p-2">{r.obraSocial ?? "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button onClick={handleCreateAll} disabled={loading} className="w-full mb-8 rounded  h-11 bg-[#008C93] hover:bg-[#007381]">
                    {loading ?
                      (<>
                        <Loader2 className="h-5 w-5 animate-spin" /> Procesando…
                      </>) : ("Crear/actualizar usuarios")}
                  </Button>
                </>
              )
            )
          ) :
            (
              (
                excelRows.length > 0 && (
                  <>
                    <div className="rounded border mb-8">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="p-2 text-left">UserId</th>
                            <th className="p-2 text-left">CUIL</th>
                            <th className="p-2 text-left">Apellido y nombre</th>
                            <th className="p-2 text-left">Legajo</th>
                            <th className="p-2 text-left">Fecha ingreso</th>
                          </tr>
                        </thead>
                        <tbody>
                          {excelRows.map((r, i) => (
                            <tr key={i} className="border-t">
                              <td className="p-2">{r.userId ?? "-"}</td>
                              <td className="p-2">{r.cuil ?? "-"}</td>
                              <td className="p-2">{r.apellido ?? "-"} {r.nombre ?? "-"}</td>
                              <td className="p-2">{r.legajo ?? "-"}</td>
                              <td className="p-2">{r.fechaIngreso ?? "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Button onClick={handleCreateExcelAll} disabled={loading} className="w-full mb-8 rounded h-11 bg-[#008C93] hover:bg-[#007381]">
                      {loading ?
                        (<>
                          <Loader2 className="h-5 w-5 animate-spin" /> Procesando…
                        </>) : ("Crear/actualizar usuarios")}
                    </Button>
                  </>
                )
              )
            )
          }

          <Separator />

          {/* Credenciales devueltas */}
          {creds.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  Credenciales temporales (mostrar solo ahora)
                </h3>
                <Button onClick={downloadCSV} className="mb-8 rounded h-11 bg-[#008C93] hover:bg-[#007381] text-white">
                  <FileDown className="w-6 h-6" />
                  Descargar CSV
                </Button>
              </div>

              <div className="rounded border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-2 text-left">Usuario</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Contraseña temporal</th>
                      <th className="p-2 text-left">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creds.map((c, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">{c.userId}</td>
                        <td className="p-2">{c.email}</td>
                        <td className="p-2 font-mono">{c.tempPassword}</td>
                        <td className="p-2">{c.status === "created" ? "Creado" : "Actualizado"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-muted-foreground mt-6">
                Por seguridad, estas contraseñas solo se muestran en esta pantalla. Al iniciar sesión, se requerirá cambiarlas.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ========================= Helpers ========================= */

function StringOrNull(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function nullifyEmpty(v: string | null) {
  return v && v.trim() ? v : null;
}

/** Normaliza diversas representaciones de fecha Excel → "YYYY-MM-DD" | null */
function normalizeExcelDate(input: any): string | null {
  if (input == null || input === "") return null;

  // Caso 1: ya viene "YYYY-MM-DD"
  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return null;
    // Intento parse directo
    const d = new Date(s);
    if (!isNaN(d.getTime())) return toYmd(d);

    // Si el string es tipo "dd/mm/yyyy"
    const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) {
      const [, dd, mm, yyyy] = m;
      const d2 = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      return isNaN(d2.getTime()) ? null : toYmd(d2);
    }
    return null;
  }

  // Caso 2: número serial Excel (días desde 1900-01-00 con bug de 1900)
  if (typeof input === "number") {
    const d = XLSX.SSF.parse_date_code(input); // trae y,m,d
    if (!d || !d.y || !d.m || !d.d) return null;
    const js = new Date(d.y, d.m - 1, d.d);
    return isNaN(js.getTime()) ? null : toYmd(js);
  }

  // Caso 3: ya es Date
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : toYmd(input);
  }

  return null;
}

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
