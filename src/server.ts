import cors from "cors";
import express from "express";
import { config } from "~/config";
import { CatFactType } from "~/types";
import { Utils } from "~/utils";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: "https://dynamic-profile-backend.onrender.com",
	})
);

app.get("/", (_, res) => {
	return res.status(200).json({ data: "Server is up and running!" });
});

app.get("/me", async (_, res) => {
	const catPromise = Utils.retryAsync(async () => {
		const res = await fetch("https://catfact.ninja/fact");
		if (!res.ok) {
			console.log("Could not fetch cat fact, will retry...");
			throw new Error("Failed to fetch cat fact");
		}
		const data = (await res.json()) as CatFactType;
		return data.fact;
	});

	const { data: catFact } = await Utils.tryCatch(() =>
		Promise.race([catPromise, Utils.sleep(2000, "Timeout")])
	);

	let fact =
		"In an average year, cat owners in the United States spend over $2 billion on cat food.";

	if (catFact && catFact !== "Timeout") {
		fact = catFact;
	}

	return res.status(200).json({
		status: "success",
		user: {
			email: config.email ?? "email",
			name: "Dave",
			stack: "Node.js/Express",
		},
		timestamp: new Date().toISOString(),
		fact,
	});
});

app.listen(config.port, () => {
	console.log(`Server is running on port ${config.port}`);
});
