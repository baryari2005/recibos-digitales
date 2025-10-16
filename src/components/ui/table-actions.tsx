"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal } from "lucide-react";

export type TableAction =
  | {
      label: string;
      icon: React.ReactNode;
      href: string;
    }
  | {
      label: string;
      icon: React.ReactNode;
      onConfirm: () => Promise<void> | void;
      confirmTitle?: string;
      confirmDescription?: string;
      confirmActionLabel?: string;
    };

interface TableActionsProps {
  id: string;
  actions: TableAction[];
}

export const TableActions = ({ id, actions }: TableActionsProps) => {
  const [openConfirmIndex, setOpenConfirmIndex] = useState<number | null>(null);

  const currentAction =
    openConfirmIndex !== null ? actions[openConfirmIndex] : null;

  return (
    <>
      <AlertDialog
        open={openConfirmIndex !== null}
        onOpenChange={(open) => !open && setOpenConfirmIndex(null)}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-8 h-4 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {actions.map((action, index) => {
              if ("href" in action) {
                return (
                  <Link href={action.href} key={index}>
                    <DropdownMenuItem>
                      {action.icon}
                      <span className="ml-2">{action.label}</span>
                    </DropdownMenuItem>
                  </Link>
                );
              }

              return (
                <AlertDialogTrigger asChild key={index}>
                  <DropdownMenuItem onClick={() => setOpenConfirmIndex(index)}>
                    {action.icon}
                    <span className="ml-2">{action.label}</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {currentAction && "onConfirm" in currentAction && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {currentAction.confirmTitle || "¿Estás seguro?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {currentAction.confirmDescription ||
                  "Esta acción no se puede deshacer."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  await currentAction.onConfirm();
                  setOpenConfirmIndex(null);
                }}
              >
                {currentAction.confirmActionLabel || "Confirmar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </>
  );
};
