import { GetAllPayrollReceiptsInput, GetAllPayrollReceiptsOutput } from "../../dto/get-all-payroll-receipts.dto";
import { parseMonthToDateStart, getMonthEndUTC } from "../../libs/payroll-receipt-date.utils";
import { digitsOnly } from "../../libs/payroll-receipt-string.utils";
import { PayrollReceiptRepository } from "../../repositories/payroll-receipt.repository";
import { resolvePayrollReceiptStatus } from "../../services/resolve-payroll-receipt-status";
import { GroupedPayrollReceipts, ReceiptSlim, ReceiptWithStatus, UserSlim } from "../../types/payroll-receipt.types";

function buildSummary(receipts: ReceiptSlim[]) {
  const totals = receipts.length;
  const signed = receipts.filter(
    (receipt) => receipt.signed && !receipt.signedDisagreement
  ).length;
  const disagreement = receipts.filter(
    (receipt) => receipt.signedDisagreement
  ).length;
  const unsigned = totals - signed - disagreement;

  return {
    totals,
    signed,
    disagreement,
    unsigned,
    coverage: totals
      ? Number(((signed + disagreement) / totals) * 100).toFixed(2)
      : "0.00",
  };
}

function groupReceiptsByCuil(
  receipts: ReceiptSlim[],
  users: UserSlim[]
): GroupedPayrollReceipts[] {
  const distinctCuils = Array.from(new Set(receipts.map((receipt) => receipt.cuil)));

  const userByCuil = new Map<string, UserSlim>(
    users
      .filter((user): user is UserSlim & { cuil: string } => Boolean(user.cuil))
      .map((user) => [user.cuil, user])
  );

  return distinctCuils.map((cuil) => {
    const mappedReceipts: ReceiptWithStatus[] = receipts
      .filter((receipt) => receipt.cuil === cuil)
      .map((receipt) => ({
        ...receipt,
        status: resolvePayrollReceiptStatus(receipt),
      }));

    return {
      cuil,
      user: userByCuil.get(cuil) ?? null,
      receipts: mappedReceipts,
    };
  });
}

export async function getAllPayrollReceiptsService(
  input: GetAllPayrollReceiptsInput,
  repository: PayrollReceiptRepository
): Promise<GetAllPayrollReceiptsOutput> {
  const fromDate = parseMonthToDateStart(input.from);
  const toDateStart = parseMonthToDateStart(input.to);
  const toDate = toDateStart ? getMonthEndUTC(toDateStart) : null;

  const cuilDigits = digitsOnly(input.search);

  const matchedCuils = input.search
    ? await repository.findMatchedUserCuils({
        search: input.search,
        cuilDigits,
      })
    : [];

  const receipts = await repository.findReceipts({
    search: input.search,
    cuilDigits,
    matchedCuils,
    fromDate,
    toDate,
    status: input.status,
  });

  const distinctCuils = Array.from(new Set(receipts.map((receipt) => receipt.cuil)));

  const users = await repository.findUsersByCuils(distinctCuils);

  return {
    summary: buildSummary(receipts),
    groups: groupReceiptsByCuil(receipts, users),
  };
}