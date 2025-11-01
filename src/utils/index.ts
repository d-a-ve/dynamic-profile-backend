export const Utils = {
	sleep: async <T>(ms: number, val?: T) =>
		new Promise<T | null>((resolve) => setTimeout(() => resolve(val ?? null), ms)),
	retryAsync: async <T>(
		fn: () => Promise<T>,
		config: { maxRetries?: number; delay?: number } = {}
	): Promise<T> => {
		const { maxRetries = 3, delay = 1000 } = config;
		const callFn = async (current: number) => {
			try {
				return await fn();
			} catch (e) {
				if (current < maxRetries) {
					console.log('Retrying... attempt:', current + 1);
					Utils.sleep(delay);
					return callFn(current + 1);
				}
				throw e;
			}
		};
		return callFn(0);
	},
	tryCatch: async <T, E = Error>(
		fn: () => Promise<T>
	): Promise<{ data: T | null; error: E | null }> => {
		try {
			const data = await fn();
			return { data, error: null };
		} catch (e) {
			return { data: null, error: e as E };
		}
	},
};
