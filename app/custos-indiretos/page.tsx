"use client";

import { useState } from "react";
import {
  useAddIndirectCost,
  useIndirectCosts,
  useRemoveIndirectCost,
  useUpdateIndirectCost,
} from "@/store/pricing.store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Card from "@/components/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Pencil, Trash2, Check, X } from "lucide-react";

export default function CustosIndiretos() {
  const addCost = useAddIndirectCost();
  const removeCost = useRemoveIndirectCost();
  const updateCost = useUpdateIndirectCost();
  const indirectCosts = useIndirectCosts();
  const router = useRouter();

  const [name, setName] = useState("");
  const [value, setValue] = useState(0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editValue, setEditValue] = useState(0);

  const add = () => {
    if (!name || value <= 0) return;
    addCost({ id: crypto.randomUUID(), name, monthlyValue: value });
    setName("");
    setValue(0);
  };

  const startEdit = (id: string, currentName: string, currentValue: number) => {
    setEditingId(id);
    setEditName(currentName);
    setEditValue(currentValue);
  };

  const confirmEdit = (id: string) => {
    if (!editName || editValue <= 0) return;
    updateCost({ id, name: editName, monthlyValue: editValue });
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  return (
    <main className="container mx-auto py-12 px-4 max-w-xl">
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-2xl font-bold text-primary">
            Custos Indiretos (mensais)
          </h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-5 w-5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  <strong>Custos Indiretos</strong> são gastos fixos do negócio
                  que não dependem de quantas unidades você produz. Exemplos:
                  aluguel, energia elétrica, internet e mão de obra administrativa.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Formulário de adição */}
        <div className="space-y-4 mb-8">
          <div className="space-y-2">
            <Label htmlFor="indirect-name">Categoria de Custo</Label>
            <Input
              id="indirect-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Aluguel, Internet"
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="indirect-value">Valor mensal (R$)</Label>
            <Input
              id="indirect-value"
              type="number"
              value={value || ""}
              onChange={(e) => setValue(+e.target.value)}
              placeholder="0,00"
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
          </div>
          <Button onClick={add} variant="secondary" className="w-full">
            Adicionar custo indireto
          </Button>
        </div>

        {/* Lista de custos adicionados */}
        {indirectCosts.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wider">
              Custos Adicionados
            </h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">Valor Mensal</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {indirectCosts.map((cost) =>
                    editingId === cost.id ? (
                      <TableRow key={cost.id}>
                        <TableCell>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 text-sm"
                            autoFocus
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editValue || ""}
                            onChange={(e) => setEditValue(+e.target.value)}
                            className="h-8 text-sm text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-green-600 hover:text-green-700"
                              onClick={() => confirmEdit(cost.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground"
                              onClick={cancelEdit}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={cost.id}>
                        <TableCell className="font-medium">{cost.name}</TableCell>
                        <TableCell className="text-right">
                          R$ {cost.monthlyValue.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => startEdit(cost.id, cost.name, cost.monthlyValue)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeCost(cost.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div className="border-t pt-6 flex justify-end">
          <Button onClick={() => router.push("/margem")} size="lg">
            Ir para Margem →
          </Button>
        </div>
      </Card>
    </main>
  );
}