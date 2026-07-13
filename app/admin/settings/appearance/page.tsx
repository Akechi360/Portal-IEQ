import { Upload } from "lucide-react";
import { InputField, ColorPickerField, SelectField, MockNotice } from "../components";

export default function AppearanceSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <MockNotice>
        El portal cautivo (/login) ya tiene la marca teal de Clínica IEQ fija en código —
        estos campos aún no la sobrescriben, así que cambiarlos aquí no afecta lo que ven los pacientes.
      </MockNotice>

      {/* Identidad */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">Identidad</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mb-6">
          <InputField label="Nombre del portal" defaultValue="Portal IEQ" />
          <InputField label="Slogan / mensaje de bienvenida" defaultValue="Bienvenido a Clínica IEQ" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Logo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-500">Logo de la clínica</label>
            <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 transition-colors hover:bg-neutral-100 cursor-pointer">
              <Upload className="h-6 w-6 text-neutral-400 mb-2" />
              <p className="text-xs font-medium text-neutral-600">Subir imagen PNG/SVG</p>
              <p className="text-[10px] text-neutral-400 mt-1">Máx 2MB</p>
            </div>
          </div>
          {/* Fondo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-500">Imagen de fondo del portal</label>
            <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 transition-colors hover:bg-neutral-100 cursor-pointer">
              <Upload className="h-6 w-6 text-neutral-400 mb-2" />
              <p className="text-xs font-medium text-neutral-600">Subir imagen de fondo</p>
              <p className="text-[10px] text-neutral-400 mt-1">1920x1080 recomendado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Colores */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">Colores</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <ColorPickerField label="Color primario" defaultValue="#12aeb4" />
          <ColorPickerField label="Color secundario" defaultValue="#334155" />
          <ColorPickerField label="Color de fondo" defaultValue="#f8fafc" />
          <ColorPickerField label="Color del texto principal" defaultValue="#1e293b" />
        </div>
      </div>

      {/* Tipografía */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">Tipografía</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <SelectField 
            label="Fuente principal" 
            defaultValue="Inter" 
            options={["Inter", "Roboto", "Poppins", "System default"]}
          />
          <SelectField 
            label="Tamaño base" 
            defaultValue="Normal" 
            options={["Pequeño", "Normal", "Grande"]}
          />
        </div>
      </div>

      {/* Textos del portal público */}
      <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-6">
        <h3 className="mb-5 text-sm font-semibold text-neutral-800">Textos del portal público</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <InputField label="Título de la pantalla de login" defaultValue="Portal IEQ" />
          <InputField label="Texto del botón de acceso" defaultValue="Conectarme" />
          <InputField 
            label="Instrucción principal" 
            defaultValue="Introduce tu token de acceso para conectarte al WiFi" 
            colSpan={true}
          />
          <InputField label="Mensaje de éxito" defaultValue="¡Conexión exitosa! Ya tienes acceso al WiFi." colSpan={true} />
          <InputField label="Mensaje de error" defaultValue="Credencial inválida. Contacta a Admisión." colSpan={true} />
        </div>
      </div>
    </div>
  );
}
