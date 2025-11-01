// src/components/import-users/ImportUsersView.tsx
"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/axios";
import { extractDniFromCuil } from "@/lib/cuil";
import * as XLSX from "xlsx";

import SourceSelector from "./SourceSelector";
import UploadField from "./UploadField";
import PreviewPdfTable from "./PreviewPdfTable";
import PreviewExcelTable from "./PreviewExcelTable";
import CredentialsTable from "./CredentialsTable";
import ExcelHeadersDialog from "./ExcelHeadersDialog";

import { Source, PdfRow, ExcelRow, Cred } from "./types";
import {
  StringOrNull,
  nullifyEmpty,
  normalizeExcelDate,
} from "@/lib/import-excel-helpers";
import { Users } from "lucide-react";

export default function ImportUsersView() {
  const [source, setSource] = useState<Source>("pdf");
  const [rows, setRows] = useState<PdfRow[]>([]);
  const [excelRows, setExcelRows] = useState<ExcelRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [creds, setCreds] = useState<Cred[]>([]);
  const [showHeadersModal, setShowHeadersModal] = useState(false);

  // limpiar cuando cambio de PDF <-> Excel
  function clearData() {
    setRows([]);
    setExcelRows([]);
    setCreds([]);
  }

  const acceptBySource = useMemo(
    () => (source === "pdf" ? "application/pdf" : ".xlsx,.xls,.csv"),
    [source]
  );

  // ----------------- 1) PDF -----------------
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
      toast.error(
        e?.response?.data?.message ?? e?.message ?? "No se pudo procesar el PDF"
      );
    } finally {
      setLoading(false);
    }
  }

  // ----------------- 2) Excel -----------------
  async function handleUploadExcel(file: File | null) {
    if (!file) return;
    setLoading(true);
    setCreds([]);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const shName = wb.SheetNames[0];
      const ws = wb.Sheets[shName];

      const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, {
        defval: null,
      });

      const mapped: ExcelRow[] = json.map((r) => {
        const userId = r.userId ?? r["userId"] ?? null;
        const tipoDocumento = r.tipoDocumento ?? r["tipoDocumento"] ?? null;
        const documento = r.documento ?? r["documento"] ?? null;
        const cuil = r.cuil ?? r["cuil"] ?? null;
        const email = r.email ?? r["email"] ?? null;
        const nombre = r.nombre ?? r["nombre"] ?? null;
        const apellido = r.apellido ?? r["apellido"] ?? null;

        const rawFecha = r.fechaNacimiento ?? r["fechaNacimiento"] ?? null;
        const fechaNacimiento = normalizeExcelDate(rawFecha);

        const rawFechaIngreso = r.fechaIngreso ?? r["fechaIngreso"] ?? null;
        const fechaIngreso = normalizeExcelDate(rawFechaIngreso);

        const rawFechaEgreso = r.fechaEgreso ?? r["fechaEgreso"] ?? null;
        const fechaEgreso = normalizeExcelDate(rawFechaEgreso);

        const celular = r.celular ?? r["celular"] ?? null;
        const domicilio = r.domicilio ?? r["domicilio"] ?? null;
        const codigoPostal = r.codigoPostal ?? r["codigoPostal"] ?? null;
        const estadoCivil = r.estadoCivil ?? r["estadoCivil"] ?? null;
        const nacionalidad = r.nacionalidad ?? r["nacionalidad"] ?? null;
        const legajo = r.numeroLegajo ?? r["numeroLegajo"] ?? r["legajo"] ?? null;
        const genero = r.genero ?? r["genero"] ?? null;
        const matriculaProvincial =
          r.matriculaProvincial ?? r["matriculaProvincial"] ?? null;
        const matriculaNacional =
          r.matriculaNacional ?? r["matriculaNacional"] ?? null;
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
          matriculaProvincial: nullifyEmpty(
            StringOrNull(matriculaProvincial)
          ),
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

  // ----------------- 3) Crear/actualizar (PDF) -----------------
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
              ? `${apellido}.${nombre}`
                  .toLowerCase()
                  .replace(/[^a-zñáéíóú0-9]+/g, ".")
              : r.legajo || r.cuil || `u_${Date.now()}`;

          const payload = {
            user: {
              userId: baseId,
              documentType: "DNI",
              documentNumber: extractDniFromCuil(r.cuil || ""),
              cuil: r.cuil || null,
              email: `${baseId}@example.com`,
              nombre,
              apellido,
              rolId: 2,
            },
            legajo: {
              employeeNumber: r.legajo ? Number(r.legajo) : null,
              admissionDate: r.fechaIngreso || null,
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

          const { data } = await axiosInstance.post(
            "/users/import-upsert?setTemp=1",
            payload
          );

          if (data?.user?.userId && data?.user?.email && data?.tempPassword) {
            out.push({
              userId: data.user.userId,
              email: data.user.email,
              tempPassword: data.tempPassword,
              status: data?.legajo ? "updated" : "created",
            });
          }

          okCount++;
        } catch (e) {
          failCount++;
        }
      }

      setCreds(out);
      toast.success(`Listo: ${okCount} ok, ${failCount} con error`);
    } finally {
      setLoading(false);
    }
  }

  // ----------------- 4) Crear/actualizar (Excel) -----------------
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
          const payload = {
            user: {
              userId: r.userId,
              documentType: r.tipoDocumento,
              documentNumber: r.documento,
              cuil: r.cuil || null,
              email: r.email,
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
              admissionDate: r.fechaIngreso || null,
              terminationDate: null,
              employmentStatus: "ACTIVO",
              contractType: "INDETERMINADO",
              position: r.puesto,
              area: r.area,
              department: r.departamento,
              category: r.categoria,
              notes: r.observaciones,
              matriculaProvincial: r.matriculaProvincial,
              matriculaNacional: r.matriculaNacional,
            },
          };

          const { data } = await axiosInstance.post(
            "/users/import-upsert?setTemp=1",
            payload
          );

          if (data?.user?.userId && data?.user?.email && data?.tempPassword) {
            out.push({
              userId: data.user.userId,
              email: data.user.email,
              tempPassword: data.tempPassword,
              status: data?.legajo ? "updated" : "created",
            });
          }

          okCount++;
        } catch (e) {
          failCount++;
        }
      }

      setCreds(out);
      toast.success(`Listo: ${okCount} ok, ${failCount} con error`);
    } finally {
      setLoading(false);
    }
  }

  // ----------------- 5) Descargar CSV -----------------
  function downloadCSV() {
    if (!creds.length) return;
    const header = "userId,email,tempPassword\n";
    const body = creds
      .map((r) => `${r.userId},${r.email},${r.tempPassword}`)
      .join("\n");
    const blob = new Blob([header + body], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "claves-temporales.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center">
            <Users className="mr-2" />
            Importar Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SourceSelector
            source={source}
            setSource={setSource}
            clearData={clearData}
          />

          <UploadField
            source={source}
            accept={acceptBySource}
            onPdfUpload={handleUploadPdf}
            onExcelUpload={handleUploadExcel}
            onOpenHeaders={() => setShowHeadersModal(true)}
          />

          {source === "pdf" ? (
            <PreviewPdfTable
              rows={rows}
              loading={loading}
              onCreateAll={handleCreateAll}
            />
          ) : (
            <PreviewExcelTable
              rows={excelRows}
              loading={loading}
              onCreateAll={handleCreateExcelAll}
            />
          )}

          <Separator />

          <CredentialsTable creds={creds} onDownload={downloadCSV} />
        </CardContent>
      </Card>

      <ExcelHeadersDialog
        open={showHeadersModal}
        onOpenChange={setShowHeadersModal}
      />
    </div>
  );
}
