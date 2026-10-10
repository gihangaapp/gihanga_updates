import { n as api } from "./api-client-C-02deeD.mjs";
import { a as useQueryClient, n as useMutation, r as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-wallet-D-qVJYDE.js
function useWallet() {
	return useQuery({
		queryKey: ["wallet", "me"],
		queryFn: () => api.get("/wallet/me"),
		refetchInterval: 2e4
	});
}
function useWalletTransactions() {
	return useQuery({
		queryKey: ["wallet", "transactions"],
		queryFn: () => api.get("/wallet/transactions"),
		refetchInterval: 2e4
	});
}
function useDeposit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input) => api.post("/wallet/deposit", {
			...input,
			idempotencyKey: crypto.randomUUID()
		}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wallet"] });
		}
	});
}
function useWithdraw() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input) => api.post("/wallet/withdraw", {
			...input,
			idempotencyKey: crypto.randomUUID()
		}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wallet"] });
		}
	});
}
function useConvertPoints() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (points) => api.post("/wallet/convert-points", { points }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wallet"] })
	});
}
//#endregion
export { useWithdraw as a, useWalletTransactions as i, useDeposit as n, useWallet as r, useConvertPoints as t };
