import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type MarkerType = "colapso_semantico" | "recuperacion" | "transicion" | "observacion";

interface MarkerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { title: string; description: string; markerType: MarkerType }) => void;
  initialData?: {
    title: string;
    description: string;
    markerType: MarkerType;
  };
  messageIndex: number;
}

export function MarkerDialog({ open, onOpenChange, onSave, initialData, messageIndex }: MarkerDialogProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [markerType, setMarkerType] = useState<MarkerType>(initialData?.markerType || "observacion");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setMarkerType(initialData.markerType);
    } else {
      setTitle("");
      setDescription("");
      setMarkerType("observacion");
    }
  }, [initialData, open]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title, description, markerType });
    onOpenChange(false);
  };

  const getMarkerTypeLabel = (type: MarkerType): string => {
    switch (type) {
      case "colapso_semantico":
        return "Colapso Semántico";
      case "recuperacion":
        return "Recuperación";
      case "transicion":
        return "Transición de Régimen";
      case "observacion":
        return "Observación General";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Marcador" : "Añadir Marcador"}</DialogTitle>
          <DialogDescription>
            Marca este momento en el paso {messageIndex + 1} de la sesión para referencia futura.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="markerType">Tipo de Evento</Label>
            <Select value={markerType} onValueChange={(v) => setMarkerType(v as MarkerType)}>
              <SelectTrigger id="markerType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="colapso_semantico">{getMarkerTypeLabel("colapso_semantico")}</SelectItem>
                <SelectItem value="recuperacion">{getMarkerTypeLabel("recuperacion")}</SelectItem>
                <SelectItem value="transicion">{getMarkerTypeLabel("transicion")}</SelectItem>
                <SelectItem value="observacion">{getMarkerTypeLabel("observacion")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Deriva semántica detectada"
              maxLength={255}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade detalles sobre este momento..."
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {initialData ? "Actualizar" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
